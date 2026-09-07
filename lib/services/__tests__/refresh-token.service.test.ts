import { describe, it, expect, beforeEach, vi } from "vitest";
import { refreshTokenService } from "../refresh-token.service";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/utils/errors";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockCreate = prisma.refreshToken.create as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.refreshToken.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.refreshToken.update as unknown as ReturnType<typeof vi.fn>;
const mockUpdateMany = prisma.refreshToken.updateMany as unknown as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe("RefreshTokenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateRefreshToken", () => {
    it("should generate a random token and persist its hash", async () => {
      mockCreate.mockResolvedValue({ id: "token-1" });

      const result = await refreshTokenService.generateRefreshToken("user-1");

      expect(result.rawToken).toBeDefined();
      expect(result.rawToken.length).toBe(80); // 40 bytes in hex = 80 chars
      expect(result.userId).toBe("user-1");
      expect(result.familyId).toBeDefined();
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("rotateRefreshToken", () => {
    it("should rotate an active token and return a new one in the same family", async () => {
      const initialToken = "a".repeat(80);
      const tokenHash = refreshTokenService.hashToken(initialToken);

      mockFindUnique.mockResolvedValue({
        id: "token-1",
        tokenHash,
        userId: "user-1",
        familyId: "family-123",
        isRevoked: false,
        replacedByHash: null,
        expiresAt: new Date(Date.now() + 100000),
      });

      mockTransaction.mockResolvedValue([{}, {}]);

      const rotated = await refreshTokenService.rotateRefreshToken(initialToken);

      expect(rotated.userId).toBe("user-1");
      expect(rotated.familyId).toBe("family-123");
      expect(rotated.rawToken).not.toBe(initialToken);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it("should detect reuse attack on already revoked/replaced token and revoke the entire family", async () => {
      const stolenToken = "b".repeat(80);
      const tokenHash = refreshTokenService.hashToken(stolenToken);

      mockFindUnique.mockResolvedValue({
        id: "token-stolen",
        tokenHash,
        userId: "user-1",
        familyId: "compromised-family",
        isRevoked: true,
        replacedByHash: "already-replaced-hash",
        expiresAt: new Date(Date.now() + 100000),
      });

      mockUpdateMany.mockResolvedValue({ count: 3 });

      await expect(refreshTokenService.rotateRefreshToken(stolenToken)).rejects.toThrow(UnauthorizedError);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { familyId: "compromised-family" },
        data: { isRevoked: true },
      });
    });

    it("should reject an expired refresh token", async () => {
      const expiredToken = "c".repeat(80);
      const tokenHash = refreshTokenService.hashToken(expiredToken);

      mockFindUnique.mockResolvedValue({
        id: "token-expired",
        tokenHash,
        userId: "user-1",
        familyId: "fam-1",
        isRevoked: false,
        replacedByHash: null,
        expiresAt: new Date(Date.now() - 1000), // In the past
      });

      mockUpdate.mockResolvedValue({});

      await expect(refreshTokenService.rotateRefreshToken(expiredToken)).rejects.toThrow(UnauthorizedError);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "token-expired" },
        data: { isRevoked: true },
      });
    });
  });

  describe("revocation", () => {
    it("should revoke all tokens for a user", async () => {
      mockUpdateMany.mockResolvedValue({ count: 2 });

      await refreshTokenService.revokeAllUserTokens("user-1");

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { isRevoked: true },
      });
    });

    it("should revoke a specific token", async () => {
      mockUpdateMany.mockResolvedValue({ count: 1 });
      const raw = "d".repeat(80);
      const hash = refreshTokenService.hashToken(raw);

      await refreshTokenService.revokeRefreshToken(raw);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { tokenHash: hash },
        data: { isRevoked: true },
      });
    });
  });
});
