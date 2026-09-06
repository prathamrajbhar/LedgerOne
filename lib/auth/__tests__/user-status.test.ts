import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkUserStatus, validateUserAccess } from "../user-status";
import { prisma } from "@/lib/prisma";
import { UserRole, ContactType } from "@prisma/client";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("User Status Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkUserStatus", () => {
    it("should return shouldLogout=true when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await checkUserStatus("user-123", UserRole.ADMINISTRATOR);

      expect(result).toEqual({
        exists: false,
        isActive: false,
        shouldLogout: true,
      });
    });

    it("should return shouldLogout=true when user is deactivated", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: false,
        role: UserRole.ADMINISTRATOR,
        contact: null,
      } as any);

      const result = await checkUserStatus("user-123", UserRole.ADMINISTRATOR);

      expect(result).toEqual({
        exists: true,
        isActive: false,
        shouldLogout: true,
      });
    });

    it("should return shouldLogout=false when user is active", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: true,
        role: UserRole.ADMINISTRATOR,
        contact: null,
      } as any);

      const result = await checkUserStatus("user-123", UserRole.ADMINISTRATOR);

      expect(result).toEqual({
        exists: true,
        isActive: true,
        isContactArchived: false,
        shouldLogout: false,
      });
    });

    it("should return shouldLogout=true when contact is archived", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: true,
        role: UserRole.CONTACT,
        contact: {
          id: "contact-123",
          isArchived: true,
        },
      } as any);

      const result = await checkUserStatus(
        "user-123",
        UserRole.CONTACT,
        "contact-123"
      );

      expect(result).toEqual({
        exists: true,
        isActive: true,
        isContactArchived: true,
        shouldLogout: true,
      });
    });

    it("should return shouldLogout=false when contact is active", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: true,
        role: UserRole.CONTACT,
        contact: {
          id: "contact-123",
          isArchived: false,
        },
      } as any);

      const result = await checkUserStatus(
        "user-123",
        UserRole.CONTACT,
        "contact-123"
      );

      expect(result).toEqual({
        exists: true,
        isActive: true,
        isContactArchived: false,
        shouldLogout: false,
      });
    });

    it("should return shouldLogout=true on database error", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      const result = await checkUserStatus("user-123", UserRole.ADMINISTRATOR);

      expect(result).toEqual({
        exists: false,
        isActive: false,
        shouldLogout: true,
      });
    });
  });

  describe("validateUserAccess", () => {
    it("should not throw when user is active", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: true,
        role: UserRole.ADMINISTRATOR,
        contact: null,
      } as any);

      await expect(
        validateUserAccess("user-123", UserRole.ADMINISTRATOR)
      ).resolves.toBeUndefined();
    });

    it("should throw when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        validateUserAccess("user-123", UserRole.ADMINISTRATOR)
      ).rejects.toThrow("User no longer exists");
    });

    it("should throw when user is deactivated", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: false,
        role: UserRole.ADMINISTRATOR,
        contact: null,
      } as any);

      await expect(
        validateUserAccess("user-123", UserRole.ADMINISTRATOR)
      ).rejects.toThrow("User account is deactivated");
    });

    it("should throw when contact is archived", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        isActive: true,
        role: UserRole.CONTACT,
        contact: {
          id: "contact-123",
          isArchived: true,
        },
      } as any);

      await expect(
        validateUserAccess("user-123", UserRole.CONTACT, "contact-123")
      ).rejects.toThrow("Contact account is archived");
    });
  });
});
