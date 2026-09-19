import { auth } from "./auth.config";
import { UnauthorizedError } from "../utils/errors";
import { UserRole } from "@prisma/client";

/**
 * Retrieve current authenticated session
 */
export async function getSession() {
  return await auth();
}

/**
 * Require valid authentication or throw UnauthorizedError
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return session;
}

/**
 * Require specific user role or throw UnauthorizedError
 */
export async function requireRole(allowedRoles: (UserRole | string)[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new UnauthorizedError(`Role '${session.user.role}' is not authorized for this action`);
  }

  return session;
}

/**
 * Get current user object or null
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
