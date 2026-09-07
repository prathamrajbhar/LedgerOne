import { requireAuth } from "./session";
import { Permission, hasPermission } from "./permissions";
import { UnauthorizedError } from "../utils/errors";
import { prisma } from "@/lib/prisma";

export async function requirePermission(permission: Permission | Permission[]) {
  const session = await requireAuth();
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Active status verification against DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isActive: true, role: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError("Your user account has been disabled or suspended");
  }

  const isAuthorized = permissions.some((perm) => hasPermission(user.role, perm));
  if (!isAuthorized) {
    throw new UnauthorizedError(
      `Access denied: role '${user.role}' lacks permission '${permissions.join(" | ")}'`
    );
  }

  return { session, user };
}
