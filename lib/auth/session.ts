import { auth } from "./auth.config";
import { UnauthorizedError } from "../utils/errors";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new UnauthorizedError(`Role ${session.user.role} is not authorized for this action`);
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
