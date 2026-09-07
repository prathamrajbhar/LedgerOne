"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Permission, hasPermission } from "@/lib/auth/permissions";

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function usePermission(permission: Permission): boolean {
  const { data: session } = useSession();
  const role = session?.user?.role;
  return hasPermission(role, permission);
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const isAllowed = usePermission(permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
