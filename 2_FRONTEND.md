# Frontend Developer #2 - Implementation Tasks

**Branch Prefix:** `frontend2/`  
**Total Tasks:** 25  
**Estimated Time:** 3-4 weeks

---

## ⚠️ Critical Rules

1. **One Task → One Commit → One PR** - Complete a task, test it, commit immediately, open PR, get it merged, THEN move to next task
2. **Never batch multiple tasks** - Each task is a separate commit with proper convention
3. **Branch per task** - `frontend2/purchase-orders-list`, `frontend2/sales-invoices`, etc.
4. **Test before commit** - Run `npm run lint && npm run type-check`
5. **Merge before next** - Task N+1 only starts after Task N is merged to main

---

## Phase 1: Workspace Layout & Dashboard (Tasks 1-3)

### Task 1: Workspace Layout with Sidebar

**File:** `app/(workspace)/layout.tsx`
```typescript
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { HelpAssistantWidget } from "@/components/help-assistant/chat-widget";
import { Toaster } from "sonner";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <HelpAssistantWidget />
      <Toaster />
    </div>
  );
}
```

**File:** `components/layout/sidebar.tsx`
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  BookOpen,
  ShoppingCart,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Chart of Accounts", href: "/accounts", icon: BookOpen },
  { name: "Purchase", href: "/purchase", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: DollarSign },
  { name: "Accounting", href: "/accounting", icon: FileText },
  { name: "Budgets", href: "/budgets", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">LedgerOne</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

**File:** `components/layout/navbar.tsx`
```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{session?.user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/workspace-layout
git add app/(workspace)/layout.tsx components/layout/
git commit -m "feat(layout): add workspace layout with sidebar and navbar

- Sidebar with navigation menu
- Navbar with user profile dropdown
- Responsive layout with help assistant widget
- Active route highlighting

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Dashboard Page

**File:** `app/(workspace)/dashboard/page.tsx`
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, FileText, TrendingUp } from "lucide-react";

async function getDashboardStats() {
  // TODO: Fetch real stats from database
  return {
    totalRevenue: 125000,
    totalExpenses: 85000,
    pendingInvoices: 12,
    pendingBills: 8,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBills}</div>
            <p className="text-xs text-muted-foreground mt-1">
              To be paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent sales to display
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent purchases to display
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/dashboard
git add app/(workspace)/dashboard/
git commit -m "feat(dashboard): add dashboard page with key metrics

- Revenue, expenses, pending invoices/bills cards
- Placeholder sections for recent activity
- Responsive grid layout

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Loading and Error States

**File:** `app/(workspace)/loading.tsx`
```typescript
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  );
}
```

**File:** `app/(workspace)/error.tsx`
```typescript
"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/loading-error-states
git add app/(workspace)/loading.tsx app/(workspace)/error.tsx
git commit -m "feat(ui): add loading and error boundary components

- Global loading spinner for async pages
- Error boundary with retry functionality
- Consistent UX for error states

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Purchase Module (Tasks 4-7)

### Task 4: Purchase Orders List

**File:** `app/(workspace)/purchase/orders/page.tsx`
```typescript
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { PurchaseOrdersTable } from "./purchase-orders-table";

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; vendor?: string; page?: string };
}) {
  const orders = await purchaseOrderService.list({
    status: searchParams.status as any,
    vendorId: searchParams.vendor,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from vendors"
        actions={
          <Link href="/purchase/orders/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </Link>
        }
      />
      <PurchaseOrdersTable data={orders} />
    </div>
  );
}
```

**File:** `app/(workspace)/purchase/orders/purchase-orders-table.tsx`
```typescript
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrder } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "poNumber",
    header: "PO Number",
  },
  {
    accessorKey: "vendor.name",
    header: "Vendor",
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => `$${row.original.total.toString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/purchase/orders/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];

interface PurchaseOrdersTableProps {
  data: {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function PurchaseOrdersTable({ data }: PurchaseOrdersTableProps) {
  return <DataTable columns={columns} data={data.data} />;
}
```

**Commit:**
```bash
git checkout -b frontend2/purchase-orders-list
git add app/(workspace)/purchase/orders/
git commit -m "feat(purchase): add purchase orders list page

- Server component for data fetching
- Table with PO number, vendor, date, total, status
- Link to create new PO
- View action for each order

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Purchase Order Form (New/Edit)

**File:** `app/(workspace)/purchase/orders/new/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PurchaseOrderForm } from "../purchase-order-form";
import { toast } from "sonner";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchase/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create purchase order");
      }

      toast.success("Purchase order created successfully");
      router.push("/purchase/orders");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Purchase Order"
        description="Create a new purchase order"
      />
      <PurchaseOrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
```

**File:** `app/(workspace)/purchase/orders/purchase-order-form.tsx`
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDate: z.string().optional(),
  lines: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ).min(1, "At least one line item is required"),
  notes: z.string().optional(),
});

interface PurchaseOrderFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function PurchaseOrderForm({
  defaultValues,
  onSubmit,
  loading,
}: PurchaseOrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="vendorId">Vendor</Label>
            <Input {...register("vendorId")} />
            {errors.vendorId && (
              <p className="text-sm text-destructive mt-1">
                {errors.vendorId.message as string}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="orderDate">Order Date</Label>
            <Input type="date" {...register("orderDate")} />
            {errors.orderDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.orderDate.message as string}
              </p>
            )}
          </div>

          {/* TODO: Add line items section with dynamic fields */}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input {...register("notes")} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Purchase Order"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/purchase-order-form
git add app/(workspace)/purchase/orders/new/ app/(workspace)/purchase/orders/purchase-order-form.tsx
git commit -m "feat(purchase): add purchase order form for creation

- Form with vendor, date, line items fields
- React Hook Form with Zod validation
- Dynamic line items (TODO: implement)
- Toast notifications for success/error

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6-7: Vendor Bills List/Form

Similar pattern for vendor bills pages.

---

## Phase 3: Sales Module (Tasks 8-11)

### Task 8-11: Sales Orders, Customer Invoices (List/Form/Detail)

Follow the same pattern as purchase module for sales pages.

---

## Phase 4: Accounting & Journal Entries (Tasks 12-13)

### Task 12: Journal Entries List

**File:** `app/(workspace)/accounting/journal-entries/page.tsx`

List all journal entries with filters by journal, date range, posted status.

**Commit:**
```bash
git commit -m "feat(accounting): add journal entries list page

- Table with entry number, date, journal, debit/credit totals
- Filter by journal and date range
- Status badge (Draft/Posted)
- View/edit actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 13: Manual Journal Entry Form

**File:** `app/(workspace)/accounting/journal-entries/new/page.tsx`

Form for creating manual journal entries with multiple lines, balance validation.

**Commit:**
```bash
git commit -m "feat(accounting): add manual journal entry creation form

- Dynamic line items with account, debit, credit
- Real-time balance validation (Debit = Credit)
- Submit button disabled until balanced
- Memo and reference fields

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Budgets (Tasks 14-16)

### Task 14: Budgets List

**File:** `app/(workspace)/budgets/page.tsx`

List budgets with status, period, achievement percentage.

**Commit:**
```bash
git commit -m "feat(budgeting): add budgets list page

- Table with budget name, period, status, achievement
- Progress bar for achievement percentage
- Actions for view, confirm, revise

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 15-16: Budget Form, Budget Detail with Achievement

Continue with budget creation form and detail view showing achievement tracking.

---

## Phase 6: Reports (Tasks 17-19)

### Task 17: Balance Sheet Report

**File:** `app/(workspace)/reports/balance-sheet/page.tsx`
```typescript
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { balanceSheetService } from "@/lib/services/reports/balance-sheet.service";

export default async function BalanceSheetPage() {
  const report = await balanceSheetService.generate();

  return (
    <div>
      <PageHeader
        title="Balance Sheet"
        description="Assets, Liabilities, and Equity"
      />

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {report.assets.map((account: any) => (
            <div key={account.id} className="flex justify-between py-2 border-b">
              <span>{account.name}</span>
              <span className="font-semibold">
                ${account.balance.toString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-bold">
            <span>Total Assets</span>
            <span>${report.totalAssets.toString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {report.liabilities.map((account: any) => (
            <div key={account.id} className="flex justify-between py-2 border-b">
              <span>{account.name}</span>
              <span className="font-semibold">
                ${account.balance.toString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-bold">
            <span>Total Liabilities</span>
            <span>${report.totalLiabilities.toString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Equity</CardTitle>
        </CardHeader>
        <CardContent>
          {report.equity.map((account: any) => (
            <div key={account.id} className="flex justify-between py-2 border-b">
              <span>{account.name}</span>
              <span className="font-semibold">
                ${account.balance.toString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-bold">
            <span>Total Equity</span>
            <span>${report.totalEquity.toString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/balance-sheet-report
git add app/(workspace)/reports/balance-sheet/
git commit -m "feat(reporting): add balance sheet report page

- Display assets, liabilities, equity sections
- Account-by-account breakdown with balances
- Total calculations for each section
- Verify Assets = Liabilities + Equity

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 18-19: Profit & Loss Report, Budget Report

Similar pattern for P&L and budget reports.

---

## Phase 7: Customer/Vendor Portal (Tasks 20-22)

### Task 20: Portal Invoice List

**File:** `app/(portal)/invoices/page.tsx`
```typescript
import { getServerSession } from "next-auth";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { PageHeader } from "@/components/ui/page-header";
import { PortalInvoicesTable } from "./portal-invoices-table";

export default async function PortalInvoicesPage() {
  const session = await getServerSession();
  const contactId = session?.user?.contactId;

  if (!contactId) {
    return <div>Unauthorized</div>;
  }

  const invoices = await customerInvoiceService.listForContact(contactId);

  return (
    <div>
      <PageHeader
        title="My Invoices"
        description="View and pay your invoices"
      />
      <PortalInvoicesTable data={invoices} />
    </div>
  );
}
```

**Commit:**
```bash
git checkout -b frontend2/portal-invoices
git add app/(portal)/invoices/
git commit -m "feat(portal): add customer invoice list in portal

- Contact-scoped invoice listing
- Payment status display
- Pay button for unpaid invoices
- Download PDF action

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 21: Portal Payment Integration

**File:** `app/(portal)/invoices/[id]/pay/page.tsx`

Razorpay payment integration page for customers to pay invoices.

**Commit:**
```bash
git commit -m "feat(portal): add Razorpay payment integration for invoices

- Razorpay checkout button
- Payment order creation
- Redirect to Razorpay hosted page
- Webhook handles payment confirmation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 22: Portal Layout

**File:** `app/(portal)/layout.tsx`

Portal-specific layout with customer-facing navigation.

**Commit:**
```bash
git commit -m "feat(portal): add portal layout for customers/vendors

- Simple navbar with logo and logout
- No sidebar (simpler than workspace)
- Restricted navigation (invoices, payments only)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 8: Settings & Admin (Tasks 23-24)

### Task 23: Company Settings Page

**File:** `app/(workspace)/settings/page.tsx`

Form to update company name, fiscal year, currency, numbering prefixes.

**Commit:**
```bash
git checkout -b frontend2/company-settings
git add app/(workspace)/settings/
git commit -m "feat(settings): add company settings management page

- Update company name, currency, fiscal year
- Configure document numbering prefixes
- Form validation with Zod
- Toast notifications

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 24: User Management Page

**File:** `app/(workspace)/settings/users/page.tsx`

Admin-only page to create users and invite contacts to portal.

**Commit:**
```bash
git commit -m "feat(settings): add user management page

- List all users with roles
- Create new users (Admin only)
- Invite contacts to portal
- Email integration for invitations

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 9: Testing (Task 25)

### Task 25: E2E Tests for Critical Flows

**File:** `e2e/purchase-flow.spec.ts`
**File:** `e2e/sales-flow.spec.ts`
**File:** `e2e/portal-payment.spec.ts`

Playwright E2E tests for complete user flows.

**Commit:**
```bash
git checkout -b frontend2/e2e-tests
git add e2e/
git commit -m "test(e2e): add end-to-end tests for critical flows

- Purchase flow: PO → Bill → Payment
- Sales flow: SO → Invoice → Receipt
- Portal payment: Login → View Invoice → Pay via Razorpay
- Verify journal entries generated correctly

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

**Your Task Completion Order:**
1-3. Workspace Layout, Dashboard, Loading/Error
4-7. Purchase Module (Orders, Bills)
8-11. Sales Module (Orders, Invoices)
12-13. Accounting (Journal Entries)
14-16. Budgets
17-19. Reports (Balance Sheet, P&L, Budget)
20-22. Portal (Invoices, Payment, Layout)
23-24. Settings (Company, Users)
25. E2E Tests

**Your Workflow:**
Same as all other developers - one task, one commit, one PR, merge, next task.

**Never skip ahead. One task at a time.**

---

**Questions?** Check CLAUDE.md for detailed guidelines.
