"use server";

import { prisma } from "@/lib/prisma";
import { authService } from "@/lib/services/auth.service";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function handleCreateStaffUser(input: Record<string, unknown>, requestingUserId: string) {
  try {
    const name = String(input.name || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    const role = String(input.role || "ACCOUNTANT").toUpperCase() === "ADMINISTRATOR" ? UserRole.ADMINISTRATOR : UserRole.ACCOUNTANT;

    if (!name || !email) return { success: false, error: "Staff name and email address are required." };

    let loginId = String(input.loginId || "").trim();
    if (!loginId || loginId.length < 6) {
      const clean = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 7) || "staff";
      loginId = `${clean}${Math.floor(100 + Math.random() * 900)}`;
      if (loginId.length < 6) loginId = `${loginId}001`;
    }

    let password = String(input.initialPassword || "").trim();
    if (!password || password.length < 8) {
      password = `Ledger@${Math.floor(1000 + Math.random() * 9000)}!`;
    }

    const user = await authService.createUser({ name, email, loginId, password, role }, requestingUserId);
    revalidatePath("/users");

    return {
      success: true,
      action: "createStaffUserAction",
      message: `Created staff account '${user.name}' (${user.role}). Login ID: ${user.loginId}, Initial Password: ${password}`,
      user: { id: user.id, name: user.name, email: user.email, loginId: user.loginId, role: user.role, initialPassword: password },
    };
  } catch (err) {
    return { success: false, action: "createStaffUserAction", error: (err as Error).message || "Failed to create staff user." };
  }
}

export async function handleInviteContactToPortal(input: Record<string, unknown>, requestingUserId: string) {
  try {
    const query = String(input.contactNameOrEmail || input.contactId || "").trim();
    if (!query) return { success: false, error: "Contact name or email is required." };

    const contact = await prisma.contact.findFirst({
      where: { OR: [{ id: query }, { email: { equals: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }] },
    });

    if (!contact) return { success: false, error: `No contact found matching '${query}'. Please create the contact first.` };

    const inv = await authService.inviteContactToPortal({ contactId: contact.id, invitedByUserId: requestingUserId });
    revalidatePath("/users");

    return {
      success: true,
      action: "inviteContactToPortalAction",
      message: `Invited contact '${contact.name}' (${contact.email}) to Portal. Login ID: ${inv.loginId}`,
      invitation: { contactName: contact.name, email: contact.email, loginId: inv.loginId, temporaryPassword: inv.temporaryPassword },
    };
  } catch (err) {
    return { success: false, action: "inviteContactToPortalAction", error: (err as Error).message || "Failed to invite contact." };
  }
}

export async function handleToggleUserStatus(input: Record<string, unknown>) {
  try {
    const query = String(input.userIdentifier || "").trim();
    const isActive = Boolean(input.isActive);
    if (!query) return { success: false, error: "User identifier is required." };

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: query }, { email: { equals: query, mode: "insensitive" } }, { loginId: { equals: query, mode: "insensitive" } }] },
    });
    if (!user) return { success: false, error: `User '${query}' not found.` };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive },
      select: { id: true, name: true, email: true, loginId: true, isActive: true },
    });
    revalidatePath("/users");

    return {
      success: true,
      action: "toggleUserStatusAction",
      message: `User account '${updated.name || updated.loginId}' is now ${isActive ? "Active" : "Deactivated"}.`,
      user: updated,
    };
  } catch (err) {
    return { success: false, action: "toggleUserStatusAction", error: (err as Error).message || "Failed to update user status." };
  }
}

export async function handleUpdateUserRole(input: Record<string, unknown>) {
  try {
    const query = String(input.userIdentifier || "").trim();
    const role = String(input.newRole || "ACCOUNTANT").toUpperCase() === "ADMINISTRATOR" ? UserRole.ADMINISTRATOR : UserRole.ACCOUNTANT;
    if (!query) return { success: false, error: "User identifier is required." };

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: query }, { email: { equals: query, mode: "insensitive" } }, { loginId: { equals: query, mode: "insensitive" } }] },
    });
    if (!user) return { success: false, error: `User '${query}' not found.` };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: { id: true, name: true, email: true, loginId: true, role: true },
    });
    revalidatePath("/users");

    return {
      success: true,
      action: "updateUserRoleAction",
      message: `Updated role for '${updated.name || updated.loginId}' to ${updated.role}.`,
      user: updated,
    };
  } catch (err) {
    return { success: false, action: "updateUserRoleAction", error: (err as Error).message || "Failed to update user role." };
  }
}
