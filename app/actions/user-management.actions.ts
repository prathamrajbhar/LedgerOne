"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/lib/services/auth.service";
import { requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface UserManagementResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getUsersAction(): Promise<UserManagementResult> {
  try {
    await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      loginId: u.loginId,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      contact: u.contact,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return { success: false, error: message };
  }
}

export async function createInternalUserAction(input: {
  loginId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<UserManagementResult> {
  try {
    const session = await requireRole(["ADMINISTRATOR"]);

    const user = await authService.createUser(
      {
        loginId: input.loginId,
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role,
      },
      session.user.id
    );

    revalidatePath("/settings/users");
    revalidatePath("/settings/users-management");
    return { success: true, data: user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    return { success: false, error: message };
  }
}

export async function inviteContactToPortalAction(contactId: string): Promise<UserManagementResult> {
  try {
    const session = await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const invitation = await authService.inviteContactToPortal({
      contactId,
      invitedByUserId: session.user.id,
    });

    revalidatePath("/settings/users");
    revalidatePath("/settings/users-management");
    return { success: true, data: invitation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to invite contact to portal";
    return { success: false, error: message };
  }
}

export async function resendContactPortalInvitationAction(userId: string): Promise<UserManagementResult> {
  try {
    const session = await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const invitation = await authService.resendPortalInvitation(
      userId,
      session.user.id
    );

    revalidatePath("/settings/users");
    revalidatePath("/settings/users-management");
    return { success: true, data: invitation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resend portal invitation";
    return { success: false, error: message };
  }
}

export async function toggleUserStatusAction(userId: string, isActive: boolean): Promise<UserManagementResult> {
  try {
    await requireRole(["ADMINISTRATOR"]);

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/settings/users");
    revalidatePath("/settings/users-management");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user status";
    return { success: false, error: message };
  }
}

export async function getUninvitedContactsAction(): Promise<UserManagementResult> {
  try {
    await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const contacts = await prisma.contact.findMany({
      where: {
        userId: null,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: contacts };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch contacts";
    return { success: false, error: message };
  }
}
