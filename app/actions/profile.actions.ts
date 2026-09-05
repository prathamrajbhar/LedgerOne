"use server";

import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  loginId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contact?: {
    id: string;
    name: string;
    type: string;
    phone?: string | null;
    address?: string | null;
    profileImage?: string | null;
    bannerUrl?: string | null;
  } | null;
}

export async function getUserProfileAction(): Promise<{
  success: boolean;
  data?: UserProfileData;
  error?: string;
}> {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {
      sessionUser = null;
    }

    let user = null;
    if (sessionUser?.id) {
      user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              type: true,
              phone: true,
              address: true,
              profileImage: true,
            },
          },
        },
      });
    }

    // Fallback to active admin or accountant from database
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          role: { in: [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT] },
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              type: true,
              phone: true,
              address: true,
              profileImage: true,
            },
          },
        },
      });
    }

    // If still not found, try finding ANY user in DB
    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              type: true,
              phone: true,
              address: true,
              profileImage: true,
            },
          },
        },
      });
    }

    if (!user) {
      return {
        success: false,
        error: "No user account found in database",
      };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name || user.loginId,
        email: user.email,
        avatarUrl: ((user as unknown as { avatarUrl?: string | null }).avatarUrl) || user.contact?.profileImage || null,
        bannerUrl: ((user as unknown as { bannerUrl?: string | null }).bannerUrl) || (user.contact as unknown as { bannerUrl?: string | null })?.bannerUrl || null,
        loginId: user.loginId,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        contact: user.contact,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load user profile",
    };
  }
}

export async function updateUserProfileAction(input: {
  id?: string;
  name: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {
      sessionUser = null;
    }
    let targetId = input.id || sessionUser?.id;

    if (!targetId) {
      const activeUser = await prisma.user.findFirst({
        where: {
          role: { in: [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT] },
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      });
      targetId = activeUser?.id;
    }

    if (!targetId) {
      return { success: false, error: "User account not found" };
    }

    if (!input.name.trim()) {
      return { success: false, error: "Full Name cannot be empty" };
    }

    if (!input.email.trim() || !input.email.includes("@")) {
      return { success: false, error: "A valid email address is required" };
    }

    // Check if email already used by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: input.email.trim(),
        NOT: { id: targetId },
      },
    });

    if (existing) {
      return { success: false, error: "Email is already in use by another account" };
    }

    await prisma.user.update({
      where: { id: targetId },
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updatePasswordAction(input: {
  id?: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {
      sessionUser = null;
    }
    let targetId = input.id || sessionUser?.id;

    if (!targetId) {
      const activeUser = await prisma.user.findFirst({
        where: {
          role: { in: [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT] },
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      });
      targetId = activeUser?.id;
    }

    if (!targetId) {
      return { success: false, error: "User account not found" };
    }

    if (input.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!user) {
      return { success: false, error: "User account not found" };
    }

    if (input.currentPassword) {
      const isValid = await compare(input.currentPassword, user.password);
      if (!isValid) {
        return { success: false, error: "Current password does not match" };
      }
    }

    const hashedPassword = await hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: targetId },
      data: { password: hashedPassword },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
