"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/lib/services/auth.service";
import { requireRole } from "@/lib/auth/session";
import { UserRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface UserManagementResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GetUsersFilterInput {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResult {
  users: Array<{
    id: string;
    loginId: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    contact?: { id: string; name: string; type: string } | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function getUsersAction(
  filter?: GetUsersFilterInput
): Promise<UserManagementResult<PaginatedUsersResult>> {
  try {
    await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const page = Math.max(1, filter?.page || 1);
    const limit = Math.max(1, Math.min(100, filter?.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filter?.role) {
      where.role = filter.role;
    }

    if (typeof filter?.isActive === "boolean") {
      where.isActive = filter.isActive;
    }

    if (filter?.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { loginId: { contains: q, mode: "insensitive" } },
        { contact: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
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
        skip,
        take: limit,
      }),
    ]);

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

    return {
      success: true,
      data: {
        users: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
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

export async function deleteUserAction(userId: string): Promise<UserManagementResult> {
  try {
    const session = await requireRole(["ADMINISTRATOR"]);

    // Cannot delete own account
    if (session.user.id === userId) {
      return { success: false, error: "You cannot delete your own user account." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        contact: true,
        _count: {
          select: {
            createdPurchaseOrders: true,
            createdVendorBills: true,
            createdSalesOrders: true,
            createdInvoices: true,
            createdJournalEntries: true,
            createdBudgets: true,
          },
        },
      },
    });

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Check if user has created financial records
    const counts = targetUser._count;
    const totalTransactions =
      counts.createdPurchaseOrders +
      counts.createdVendorBills +
      counts.createdSalesOrders +
      counts.createdInvoices +
      counts.createdJournalEntries +
      counts.createdBudgets;

    if (totalTransactions > 0) {
      return {
        success: false,
        error: `Cannot delete this user because they have recorded ${totalTransactions} transactional documents (invoices/bills/orders). Deactivate the user instead to preserve the accounting audit trail.`,
      };
    }

    // If contact is attached, unlink contact first
    if (targetUser.contact) {
      await prisma.contact.update({
        where: { id: targetUser.contact.id },
        data: { userId: null },
      });
    }

    // Permanently delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/users");
    revalidatePath("/settings/users");
    revalidatePath("/settings/users-management");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return { success: false, error: message };
  }
}

