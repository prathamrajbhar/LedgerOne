import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "../utils/errors";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface GeneratedTokenResult {
  rawToken: string;
  expiresAt: Date;
  familyId: string;
  userId: string;
}

export class RefreshTokenService {
  /**
   * Hashes a raw token string using SHA-256 for secure database storage.
   */
  hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Generates a new refresh token and registers it in the database.
   */
  async generateRefreshToken(userId: string, existingFamilyId?: string): Promise<GeneratedTokenResult> {
    const rawToken = randomBytes(40).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const familyId = existingFamilyId || randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        familyId,
        expiresAt,
      },
    });

    return { rawToken, expiresAt, familyId, userId };
  }

  /**
   * Rotates an active refresh token with reuse detection.
   * If an already-used or revoked token is presented, the entire family is revoked.
   */
  async rotateRefreshToken(rawToken: string): Promise<GeneratedTokenResult> {
    const tokenHash = this.hashToken(rawToken);

    const existingToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existingToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Reuse detection: If token was already revoked or replaced, breach detected!
    if (existingToken.isRevoked || existingToken.replacedByHash) {
      await this.revokeFamily(existingToken.familyId);
      throw new UnauthorizedError("Refresh token reuse detected. All sessions have been revoked.");
    }

    // Check expiration
    if (existingToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedError("Refresh token has expired");
    }

    // Generate rotated token in same family
    const newRawToken = randomBytes(40).toString("hex");
    const newHash = this.hashToken(newRawToken);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          isRevoked: true,
          replacedByHash: newHash,
        },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: newHash,
          userId: existingToken.userId,
          familyId: existingToken.familyId,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    return {
      rawToken: newRawToken,
      expiresAt: newExpiresAt,
      familyId: existingToken.familyId,
      userId: existingToken.userId,
    };
  }

  /**
   * Revokes a specific refresh token.
   */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Revokes all refresh tokens in a given family.
   */
  async revokeFamily(familyId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { familyId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revokes all refresh tokens for a specific user.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
    data: { isRevoked: true },
    });
  }

  /**
   * Purges expired and revoked tokens from the database.
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    return result.count;
  }
}

export const refreshTokenService = new RefreshTokenService();
