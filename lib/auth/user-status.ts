import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * User status validation utility
 * Checks if user exists, is active, and has valid contact (for CONTACT role)
 */

export interface UserStatusResult {
  exists: boolean;
  isActive: boolean;
  isContactArchived?: boolean;
  shouldLogout: boolean;
}

/**
 * Check if user should be logged out based on their current status
 * This runs on every session validation to ensure real-time security
 */
export async function checkUserStatus(
  userId: string,
  role: UserRole,
  contactId?: string | null
): Promise<UserStatusResult> {
  try {
    // Fetch user with contact if applicable
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        role: true,
        contact: contactId
          ? {
              select: {
                id: true,
                isArchived: true,
              },
            }
          : false,
      },
    });

    // User doesn't exist (deleted)
    if (!user) {
      return {
        exists: false,
        isActive: false,
        shouldLogout: true,
      };
    }

    // User is deactivated
    if (!user.isActive) {
      return {
        exists: true,
        isActive: false,
        shouldLogout: true,
      };
    }

    // For CONTACT role users, check if their contact is archived
    if (role === UserRole.CONTACT && contactId) {
      const isContactArchived = user.contact?.isArchived ?? false;

      if (isContactArchived) {
        return {
          exists: true,
          isActive: true,
          isContactArchived: true,
          shouldLogout: true,
        };
      }
    }

    // User is valid and active
    return {
      exists: true,
      isActive: true,
      isContactArchived: false,
      shouldLogout: false,
    };
  } catch (error) {
    // On error, log out for safety
    console.error("Error checking user status:", error);
    return {
      exists: false,
      isActive: false,
      shouldLogout: true,
    };
  }
}

/**
 * Validate user is active and should have access
 * Throws error if user should be logged out
 */
export async function validateUserAccess(
  userId: string,
  role: UserRole,
  contactId?: string | null
): Promise<void> {
  const status = await checkUserStatus(userId, role, contactId);

  if (status.shouldLogout) {
    if (!status.exists) {
      throw new Error("User no longer exists");
    }
    if (!status.isActive) {
      throw new Error("User account is deactivated");
    }
    if (status.isContactArchived) {
      throw new Error("Contact account is archived");
    }
    throw new Error("User access revoked");
  }
}
