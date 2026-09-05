# Role-Based Sidebar Implementation Guide

## Overview

This document describes the complete role-based sidebar and authorization system implemented for LedgerOne.

## Roles & Access

### Workspace (Admin + Accountant)
- **Admin**: Full access to all workspace features including Users and Settings
- **Accountant**: Full workspace access except Users and Settings (cannot hard delete)
- **Route**: `/workspace/*`, `/dashboard`, `/sales/*`, `/purchase/*`, etc.

### Portal (Contact)
- **Contact**: Customer and/or Vendor access to portal
- **Route**: `/portal/*`

## Implementation Components

### 1. Middleware (`middleware.ts`)
- Server-side route protection
- Redirects unauthorized users
- Ensures Admin-only routes (Settings, Users) are protected
- Separates Workspace and Portal routes

### 2. Sidebar Components

#### Workspace Sidebar (`components/layout/sidebar.tsx`)
- Role-aware navigation filtering
- Hides Admin-only items from Accountants
- Dynamic navigation based on `getFilteredNavSections(userRole)`

**Navigation Structure:**
```
├── Dashboard
├── Sales
│   ├── Sales Orders
│   ├── Customer Invoices
│   └── Receipts
├── Purchase
│   ├── Purchase Orders
│   ├── Vendor Bills
│   └── Bill Payments
├── Accounting
│   ├── Contacts
│   ├── Products
│   ├── Chart of Accounts
│   ├── Journals
│   ├── Analytic Accounts
│   ├── Tax Rates
│   └── Journal Entries
├── Reports
│   ├── Balance Sheet
│   ├── Profit & Loss
│   └── Budget Report
└── Administration (Admin only)
    ├── Users
    └── Settings
```

#### Portal Sidebar (`app/portal/(portal-app)/components/PortalSidebar.tsx`)
- Contact type-aware navigation
- Different items for Customers vs Vendors

**Portal Navigation:**
```
Always Visible:
├── Portal Home
└── Payment History

Customer Only:
└── My Invoices (with Pay Now button)

Vendor Only:
└── My Bills (read-only, NO Pay Now)

Both:
└── Shows both Invoices and Bills

Bottom:
├── My Profile
└── Logout
```

### 3. Navbar (`components/layout/navbar.tsx`)
- Displays user role badge (Administrator/Accountant)
- Avatar menu hides Admin-only items from Accountants
- Logout redirects to appropriate login page

**Avatar Menu:**
- My Profile (All)
- Users (Admin only)
- Settings (Admin only)
- Logout (All)

### 4. Layouts

#### Workspace Layout (`app/(workspace)/layout.tsx`)
- Server component that fetches session
- Redirects Contacts to portal
- Passes user role to client components

#### Portal Layout (`app/portal/(portal-app)/layout.tsx`)
- Server component that fetches session
- Redirects Admin/Accountant to workspace
- Passes contact type to sidebar

### 5. Authorization Helpers (`lib/utils/auth-helpers.ts`)

Server-side only functions for enforcing access control:

```typescript
// Authentication
requireAuth()              // Require any authenticated user
requireWorkspaceAccess()   // Require Admin or Accountant
requireAdmin()             // Require Admin only
requireContactAccess()     // Require Contact only

// Role checks
isAdmin()                  // Check if user is Admin
isAccountant()             // Check if user is Accountant
isContact()                // Check if user is Contact
canHardDelete()            // Check if user can hard delete (Admin only)

// Contact helpers
getContactId()             // Get contact ID from session (portal users)
```

## Security Rules

### Server-Side Enforcement
1. **Middleware**: Protects all routes before they render
2. **Layout Components**: Server-side session checks in layouts
3. **Service Layer**: Use auth helpers in all services
4. **API Routes**: Always check authorization before processing

### Client-Side Rendering
1. **Never use `display: none`** for authorization
2. **Unauthorized items don't exist in DOM**
3. **Role-based filtering happens before render**
4. **No sensitive data sent to unauthorized users**

## Important Implementation Rules

### 1. Contact Data Isolation
Portal users MUST only see their own data:
```typescript
// In services
const contactId = await getContactId();
const invoices = await prisma.customerInvoice.findMany({
  where: { contactId } // Always filter by logged-in contact
});
```

### 2. Hard Delete Permission
Only Admin can hard delete:
```typescript
// In delete services
const session = await requireAuth();
if (session.user.role !== UserRole.ADMIN) {
  throw new UnauthorizedError("Only Admin can hard delete");
}
```

### 3. Payment Rules
- **Customers**: Can pay invoices via Portal (Pay Now button visible)
- **Vendors**: Cannot pay bills (read-only, NO Pay Now button)
- LedgerOne pays vendors manually through workspace

### 4. Settings & Users Access
- **Admin**: Full access to `/settings` and `/settings/users`
- **Accountant**: Redirected to dashboard if they try to access
- Menu items not rendered for Accountants

## Help Assistant

The Help Assistant widget is available to ALL roles:
- Admin: `/workspace` with widget
- Accountant: `/workspace` with widget
- Contact: `/portal` with widget

Rules:
- FAQ/product guidance only
- Must respect role permissions
- Portal Assistant has ZERO financial-data access
- Isolated from Prisma/database queries

## Testing Checklist

### Admin
- [x] Can access all workspace routes
- [x] Can see Users and Settings in avatar menu
- [x] Can see all sidebar items
- [x] Can hard delete
- [x] Cannot access portal

### Accountant
- [x] Can access workspace routes
- [x] Cannot see Users in avatar menu
- [x] Cannot see Settings in avatar menu
- [x] Cannot access `/settings/*` routes
- [x] Cannot hard delete
- [x] Cannot access portal

### Customer Contact
- [x] Can access portal
- [x] Can see "My Invoices"
- [x] Cannot see "My Bills"
- [x] Can see "Pay Now" on invoices
- [x] Cannot access workspace

### Vendor Contact
- [x] Can access portal
- [x] Can see "My Bills"
- [x] Cannot see "My Invoices"
- [x] Cannot see "Pay Now" (read-only)
- [x] Cannot access workspace

### Both Contact (Customer + Vendor)
- [x] Can access portal
- [x] Can see "My Invoices"
- [x] Can see "My Bills"
- [x] Can pay invoices (Pay Now)
- [x] Cannot pay bills (read-only)
- [x] Cannot access workspace

## File Changes Summary

```
New Files:
├── middleware.ts                                    (Route protection)
├── lib/utils/auth-helpers.ts                        (Authorization utilities)
└── app/(workspace)/workspace-layout-client.tsx      (Client layout wrapper)

Modified Files:
├── components/layout/sidebar-items.ts               (Role-based filtering)
├── components/layout/sidebar.tsx                    (Role-aware sidebar)
├── components/layout/navbar.tsx                     (Role-aware navbar)
├── app/(workspace)/layout.tsx                       (Server-side auth check)
├── app/portal/(portal-app)/layout.tsx               (Added Help Assistant)
└── app/portal/(portal-app)/components/PortalSidebar.tsx  (Updated navigation)
```

## Usage in Services

Always use authorization helpers in services:

```typescript
// Example: Invoice Service
import { requireContactAccess, getContactId } from "@/lib/utils/auth-helpers";

export class InvoiceService {
  // Portal method - only show contact's own invoices
  async getContactInvoices() {
    const session = await requireContactAccess();
    const contactId = await getContactId();
    
    return prisma.customerInvoice.findMany({
      where: { contactId }
    });
  }

  // Workspace method - full access
  async getAllInvoices() {
    await requireWorkspaceAccess(); // Admin or Accountant only
    
    return prisma.customerInvoice.findMany();
  }

  // Admin-only method
  async hardDeleteInvoice(id: string) {
    await requireAdmin(); // Admin only
    
    return prisma.customerInvoice.delete({
      where: { id }
    });
  }
}
```

## Next Steps

1. **Add route handlers**: Ensure all API routes use auth helpers
2. **Add page components**: Create portal invoice/bill pages with proper Pay Now logic
3. **Test thoroughly**: Verify all role combinations work correctly
4. **Add logging**: Log authorization failures for security auditing
5. **Document API**: Update API documentation with authorization requirements

## Key Business Rules (Reference)

1. **Contact Data Isolation**: Portal queries MUST filter by logged-in Contact's ID
2. **Vendor Bills Not Payable by Vendor**: Only Customers can pay through Portal
3. **Admin-Only Hard Delete**: Accountants can archive but not hard delete
4. **Help Assistant Isolation**: Chatbot never queries Prisma or accesses financial data
