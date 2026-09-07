import { UserRole } from "@prisma/client";

export type Permission =
  // User & Identity Management
  | "users:read"
  | "users:write"
  | "users:invite"
  // Master Data (Contacts, Products, Analytic Accounts)
  | "masters:read"
  | "masters:write"
  // Sales Flow (Orders, Invoices)
  | "sales:read"
  | "sales:write"
  | "sales:confirm"
  | "sales:cancel"
  // Purchase Flow (Orders, Vendor Bills)
  | "purchase:read"
  | "purchase:write"
  | "purchase:confirm"
  | "purchase:cancel"
  // General Ledger & Accounting (COA, Journals, Entries, Tax)
  | "accounting:read"
  | "accounting:write"
  // Payments & Settlements
  | "payments:read"
  | "payments:write"
  // Reports & Analytics
  | "reports:read"
  | "reports:export"
  // Configuration & System Settings
  | "settings:manage"
  // Customer / Vendor Self-Service Portal
  | "portal:read"
  | "portal:pay";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMINISTRATOR: [
    "users:read",
    "users:write",
    "users:invite",
    "masters:read",
    "masters:write",
    "sales:read",
    "sales:write",
    "sales:confirm",
    "sales:cancel",
    "purchase:read",
    "purchase:write",
    "purchase:confirm",
    "purchase:cancel",
    "accounting:read",
    "accounting:write",
    "payments:read",
    "payments:write",
    "reports:read",
    "reports:export",
    "settings:manage",
  ],
  ACCOUNTANT: [
    "masters:read",
    "masters:write",
    "sales:read",
    "sales:write",
    "sales:confirm",
    "sales:cancel",
    "purchase:read",
    "purchase:write",
    "purchase:confirm",
    "purchase:cancel",
    "accounting:read",
    "accounting:write",
    "payments:read",
    "payments:write",
    "reports:read",
    "reports:export",
  ],
  CONTACT: [
    "portal:read",
    "portal:pay",
  ],
};

export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole | string | undefined, permissions: Permission[]): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

export function hasAllPermissions(role: UserRole | string | undefined, permissions: Permission[]): boolean {
  return permissions.every((perm) => hasPermission(role, perm));
}
