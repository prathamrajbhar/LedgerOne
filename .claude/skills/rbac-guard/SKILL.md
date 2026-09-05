---
name: rbac-guard
description: Enforces robust Resource-Action Role-Based Access Control (RBAC) across API routes, server functions, and client UI. Use whenever creating or modifying ANY API endpoint, server action/mutation, page-level access check, permission rule, or role hierarchy.
---

# RBAC Guard

A robust authorization architecture separates authentication (who you are) from authorization (what you can do). Never scatter ad-hoc `if (user.role === 'admin')` checks across application code.

## The Five Core Rules

1. **Gate Both Layers (UI + API/Backend)**:
   - The UI conditionally hides or disables controls for a clean user experience.
   - The API/backend strictly validates permissions for every request.
   - *Hiding a button is UX, not security. Security only exists where requests are authorized on the server.*

2. **Resource-Action Permission Matrix**:
   - Model permissions as `resource:action` pairs (e.g. `users:read`, `invoices:create`, `billing:manage`).
   - Define a central permissions map or matrix where roles map to permitted actions. Adding or altering a role is an edit to the matrix, not a codebase-wide find-and-replace.

3. **Ownership-Scoped Access Helpers**:
   - For entities owned by users or tenants, use explicit authorization helpers (e.g. `canAccessResource(user, resourceOwnerId)`).
   - "Allow if user is the author OR an admin" belongs in an authorization policy function, not duplicated across endpoints.

4. **Edge / Middleware Hygiene**:
   - Keep edge/routing middleware lightweight: verify session or token existence and handle basic redirects.
   - Complex database-dependent permission resolutions should be handled in server route handlers or data access layers to avoid high latency or bundle bloat in edge environments.

5. **Mandatory Negative Testing**:
   - Every protected route or action must have an automated test or direct API verification confirming that an unauthenticated user or unauthorized role is rejected with `401 Unauthorized` or `403 Forbidden`.

## Implementation Pattern Example

```typescript
// Central permissions configuration
export const ROLE_PERMISSIONS = {
  admin: ['*'],
  manager: ['project:read', 'project:update', 'task:*'],
  member: ['project:read', 'task:read', 'task:create'],
} as const;

export function hasPermission(role: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes('*') || permissions.includes(action);
}

export function requirePermission(role: string, action: string) {
  if (!hasPermission(role, action)) {
    throw new AuthorizationError(`Forbidden: missing ${action} permission`);
  }
}
```

