# Automatic User Logout Security Feature

## Overview

LedgerOne implements automatic logout across all devices when a user account is deactivated, deleted, or (for portal users) when their associated contact is archived. This ensures that access is immediately revoked without requiring manual intervention on each device/session.

## How It Works

### 1. Real-Time Status Validation

Every time a user makes a request, the authentication system validates their current status in the database:

- **User Deleted**: Session immediately invalidated
- **User Deactivated** (`isActive = false`): Session immediately invalidated  
- **Contact Archived** (for CONTACT role users): Session immediately invalidated

### 2. Session Invalidation

When any of the above conditions are detected:

1. The JWT token is nullified in the `jwt` callback
2. The session becomes invalid on the next request
3. The user is redirected to the login page with a clear error message

### 3. User Experience

When automatically logged out, users see:
- Redirect to appropriate login page (`/login` for workspace, `/portal/login` for portal)
- Toast notification: "Your session has expired. Please log in again."
- URL parameter `?error=SessionExpired` for tracking

## Architecture

### Files Modified/Created

```
lib/auth/
├── user-status.ts          # NEW: Status validation logic
├── auth.config.ts          # MODIFIED: Added real-time validation
├── __tests__/
│   └── user-status.test.ts # NEW: Unit tests
middleware.ts               # MODIFIED: Error handling
app/(auth)/login/page.tsx   # MODIFIED: Error display
```

### Key Components

#### `lib/auth/user-status.ts`

```typescript
export async function checkUserStatus(
  userId: string,
  role: UserRole,
  contactId?: string | null
): Promise<UserStatusResult>
```

Validates user status against three conditions:
1. User exists in database
2. User is active (`isActive = true`)
3. Contact is not archived (for CONTACT role only)

Returns `shouldLogout: true` if any condition fails.

#### `lib/auth/auth.config.ts` - JWT Callback

```typescript
async jwt({ token, user, trigger, session }) {
  // ... existing code ...
  
  // CRITICAL SECURITY CHECK: Validate user status on every request
  const status = await checkUserStatus(
    token.id,
    token.role,
    token.contactId
  );
  
  if (status.shouldLogout) {
    return null; // Invalidate token
  }
  
  return token;
}
```

Runs on **every authenticated request**, ensuring immediate enforcement.

## Security Considerations

### Performance

- **Database Query per Request**: Each authenticated request triggers a lightweight query to verify user status
- **Optimized Query**: Only fetches `id`, `isActive`, and `contact.isArchived` fields
- **Indexed Fields**: All queried fields are indexed for fast lookups
- **Acceptable Tradeoff**: Security > Minor performance overhead

### Edge Cases Handled

1. **Database Errors**: If status check fails, session is invalidated for security (fail-closed)
2. **Race Conditions**: Token validation happens atomically in the JWT callback
3. **Multiple Devices**: All devices check status independently on their next request
4. **Session Lifetime**: JWT expires naturally after 30 days even without deactivation

### Bypass Prevention

- Status check cannot be disabled or bypassed
- Runs server-side only (no client manipulation possible)
- No cached status (always fresh from database)
- Middleware also validates token before processing routes

## Testing

### Unit Tests

Run tests:
```bash
npm run test lib/auth/__tests__/user-status.test.ts
```

Tests cover:
- ✅ User deletion (user not found)
- ✅ User deactivation (`isActive = false`)
- ✅ Contact archival (`contact.isArchived = true`)
- ✅ Active user validation (no logout)
- ✅ Database error handling (fail-closed)

### Manual Testing

#### Test Scenario 1: Deactivate User
1. User A logs in on Device 1 and Device 2
2. Admin deactivates User A (`isActive = false`)
3. User A makes any request on Device 1 or Device 2
4. **Expected**: Immediate logout on both devices, redirected to login

#### Test Scenario 2: Archive Contact
1. Contact user logs in on multiple devices
2. Admin archives the contact
3. Contact user makes any request
4. **Expected**: Immediate logout, "Your session has expired" message

#### Test Scenario 3: Delete User
1. User logs in
2. Admin deletes user from database
3. User makes any request
4. **Expected**: Immediate logout, redirected to login

## Administrator Usage

### Deactivating a User

To immediately revoke access across all devices:

```typescript
// In user management service
await prisma.user.update({
  where: { id: userId },
  data: { isActive: false }
});
```

Result: User is automatically logged out on their next request (usually within seconds).

### Archiving a Contact

```typescript
await prisma.contact.update({
  where: { id: contactId },
  data: { isArchived: true }
});
```

Result: Associated portal user is logged out automatically.

### Reactivating a User

```typescript
await prisma.user.update({
  where: { id: userId },
  data: { isActive: true }
});
```

Result: User can log in again immediately.

## Monitoring & Logging

### Console Logs

When a user is automatically logged out, the server logs:

```
User {userId} session invalidated: User deactivated
User {userId} session invalidated: User deleted
User {userId} session invalidated: Contact archived
```

### Tracking

- URL parameter `?error=SessionExpired` can be tracked in analytics
- Toast notifications are visible to users
- No sensitive information exposed in client-side errors

## Future Enhancements

Possible improvements (not currently implemented):

1. **Session Revocation API**: Immediate logout without waiting for next request
2. **WebSocket Notifications**: Push logout event to all active sessions
3. **Audit Log**: Track when and why users were logged out
4. **Grace Period**: Optional 5-minute grace period before logout
5. **Email Notification**: Notify users when their account is deactivated

## Related Documentation

- [Authentication System](./auth.config.ts)
- [User Management Service](../services/auth.service.ts)
- [Security Guidelines](../../CLAUDE.md#security-guidelines)
- [RBAC Documentation](../../docs/rbac.md)

## Key Business Rules

From CLAUDE.md, this feature enforces:

> **Contact Data Isolation** - Portal queries must filter by logged-in Contact's ID

By immediately logging out archived contacts, we prevent any potential data access violations.

---

**Last Updated**: 2026-09-06  
**Version**: 1.0.0  
**Status**: Production Ready ✅
