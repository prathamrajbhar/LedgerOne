"use server";

import { requirePortalAuth } from "@/lib/auth/portal-session";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface PortalProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  type: string;
  profileImage?: string | null;
  bannerUrl?: string | null;
  createdAt: string;
  user: {
    id: string;
    loginId: string;
    createdAt: string;
  } | null;
}

export async function updatePortalProfileAction(input: {
  contactId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const portalSession = await requirePortalAuth();

    // Enforce that the authenticated user can only update their own profile
    if (portalSession.contactId !== input.contactId) {
      return { success: false, error: "Unauthorized operation" };
    }

    if (!input.name.trim()) {
      return { success: false, error: "Full Name cannot be empty" };
    }

    if (!input.email.trim() || !input.email.includes("@")) {
      return { success: false, error: "A valid email address is required" };
    }

    // Check if email is already taken by another contact
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: input.email.trim(),
        NOT: { id: input.contactId },
      },
    });

    if (existingContact) {
      return { success: false, error: "Email is already registered by another contact" };
    }

    // Update Contact details
    await prisma.contact.update({
      where: { id: input.contactId },
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone ? input.phone.trim() : null,
        address: input.address ? input.address.trim() : null,
      },
    });

    // Also sync the associated User table name & email if linked
    if (portalSession.userId) {
      await prisma.user.update({
        where: { id: portalSession.userId },
        data: {
          name: input.name.trim(),
          email: input.email.trim(),
        },
      });
    }

    revalidatePath("/portal/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating portal profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updatePortalPasswordAction(input: {
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const portalSession = await requirePortalAuth();

    if (!portalSession.userId) {
      return { success: false, error: "No portal credentials linked to this profile" };
    }

    if (input.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    const user = await prisma.user.findUnique({
      where: { id: portalSession.userId },
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
      where: { id: portalSession.userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/portal/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating portal password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
