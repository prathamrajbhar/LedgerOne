import { auth } from "@/lib/auth/auth.config";
import { UserRole } from "@prisma/client";
import { UnauthorizedError } from "./errors";

/**
 * Authorization helper functions for enforcing role-based access control
 * These are server-side only and should be used in services, API routes, and server actions
 */

/**
 * Get the current session or throw if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return session;
}

/**
 * Require user to be Admin or Accountant (workspace access)
 */
export async function requireWorkspaceAccess() {
  const session = await requireAuth();

  if (session.user.role === UserRole.CONTACT) {
    throw new UnauthorizedError("Workspace access denied");
  }

  return session;
}

/**
 * Require user to be Admin only
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== UserRole.ADMINISTRATOR) {
    throw new UnauthorizedError("Admin access required");
  }

  return session;
}

/**
 * Require user to be a Contact (portal access)
 */
export async function requireContactAccess() {
  const session = await requireAuth();

  if (session.user.role !== UserRole.CONTACT || !session.user.contactId) {
    throw new UnauthorizedError("Portal access denied");
  }

  return session;
}

/**
 * Check if current user is Admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === UserRole.ADMINISTRATOR;
}

/**
 * Check if current user is Accountant
 */
export async function isAccountant(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === UserRole.ACCOUNTANT;
}

/**
 * Check if current user is Contact
 */
export async function isContact(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === UserRole.CONTACT;
}

/**
 * Check if current user can perform hard delete operations
 * Only Admin can hard delete
 */
export async function canHardDelete(): Promise<boolean> {
  return isAdmin();
}

/**
 * Get contact ID from session (for portal users)
 * Throws if user is not a contact
 */
export async function getContactId(): Promise<string> {
  const session = await requireContactAccess();

  if (!session.user.contactId) {
    throw new UnauthorizedError("Contact ID not found");
  }

  return session.user.contactId;
}
