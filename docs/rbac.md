# Urban Furniture Accounting System
## Role-Based Sidebar & RBAC

For the **Urban Furniture Accounting System**, the sidebar is role-based so each role sees only the modules required for its responsibilities.

---

## 1. 👑 Admin Sidebar

Admin has the **full system view**.

```text
Dashboard

User Management
  ├── Users
  ├── Create User
  └── Roles / Permissions

Contacts
  ├── Customers
  ├── Vendors
  └── Contacts

Products
  ├── Products
  └── Product Categories

Accounting
  ├── Chart of Accounts
  ├── Journals
  ├── Journal Entries
  ├── Payments
  └── Analytic Accounts

Sales
  ├── Sales Orders
  ├── Customer Invoices
  └── Invoice Payments

Purchase
  ├── Purchase Orders
  ├── Vendor Bills
  └── Bill Payments

Budget
  ├── Budgets
  └── Budget Reports

Reports
  ├── Profit & Loss
  ├── Balance Sheet
  └── Budget Report

Settings
  └── System Settings

Profile
Logout
```

### Admin can

- Create/manage **Admin, Accountant and User**
- Manage contacts and products
- Access all sales and purchase transactions
- Access all accounting records
- Manage budgets
- View financial reports
- Manage system configuration

---

# 2. 🧮 Accountant Sidebar

Accountant gets everything required for **financial/accounting operations**, but not user administration.

```text
Dashboard

Contacts
  ├── Customers
  ├── Vendors
  └── Contacts

Products
  └── Products

Accounting
  ├── Chart of Accounts
  ├── Journals
  ├── Journal Entries
  ├── Payments
  └── Analytic Accounts

Sales
  ├── Sales Orders
  ├── Customer Invoices
  └── Invoice Payments

Purchase
  ├── Purchase Orders
  ├── Vendor Bills
  └── Bill Payments

Budget
  ├── Budgets
  └── Budget Reports

Reports
  ├── Profit & Loss
  ├── Balance Sheet
  └── Budget Report

Profile
Logout
```

### Accountant cannot see

```text
❌ User Management
❌ Create Admin
❌ Create/Manage system roles
❌ System Settings
```

The accountant can create and manage accounting transactions, but cannot control system users.

---

# 3. 👤 User / Contact Sidebar

The User should have a **very limited portal/sidebar**.

```text
Dashboard

My Invoices
  └── Invoice List

My Bills
  └── Bill List

Payments
  └── Payment History

Profile

Logout
```

### User can

- View their own invoices
- View their own bills
- Open invoice/bill details
- Make payment
- View their payment history
- Manage/view their own profile

### User cannot see

```text
❌ Dashboard financial analytics
❌ User Management
❌ Contacts
❌ Products
❌ Chart of Accounts
❌ Journals
❌ Journal Entries
❌ Sales Orders
❌ Purchase Orders
❌ Budgets
❌ Profit & Loss
❌ Balance Sheet
❌ System Settings
```

The portal is intended for contacts to access their own invoices/bills and payments rather than the company's complete accounting data.

---

# Final Role-Based Sidebar

| Feature | 👑 Admin | 🧮 Accountant | 👤 User |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ Limited |
| User Management | ✅ | ❌ | ❌ |
| Contacts | ✅ | ✅ | ❌ |
| Products | ✅ | ✅ | ❌ |
| Chart of Accounts | ✅ | ✅ | ❌ |
| Journals | ✅ | ✅ | ❌ |
| Journal Entries | ✅ | ✅ | ❌ |
| Analytic Accounts | ✅ | ✅ | ❌ |
| Sales Orders | ✅ | ✅ | ❌ |
| Customer Invoices | ✅ | ✅ | Own only |
| Invoice Payments | ✅ | ✅ | Own only |
| Purchase Orders | ✅ | ✅ | ❌ |
| Vendor Bills | ✅ | ✅ | Own/related only |
| Bill Payments | ✅ | ✅ | Own/related only |
| Budgets | ✅ | ✅ | ❌ |
| Budget Reports | ✅ | ✅ | ❌ |
| Profit & Loss | ✅ | ✅ | ❌ |
| Balance Sheet | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |

---

# 🔥 Simple RBAC Rule

```text
ADMIN
  ↓
Full Access
  ├── Users
  ├── Masters
  ├── Transactions
  ├── Accounting
  ├── Budget
  └── Reports

ACCOUNTANT
  ↓
Financial Access
  ├── Masters
  ├── Sales
  ├── Purchase
  ├── Accounting
  ├── Budget
  └── Reports

USER
  ↓
Own Data Only
  ├── My Invoices
  ├── My Bills
  ├── Payments
  └── Profile
```

## Summary

This role-based sidebar provides a clean **RBAC (Role-Based Access Control)** structure:

- **Admin → Full system access**
- **Accountant → Financial and accounting access**
- **User → Own invoices, bills and payments only**

This structure is suitable for implementing and demonstrating RBAC in the Urban Furniture Accounting System.
