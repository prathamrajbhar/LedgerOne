import * as React from "react";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  BookOpen,
  BookText,
  Users,
  Package,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  PieChart,
  Settings,
  FolderTree,
  FileCheck,
  Coins,
  Building,
  Database,
  Layers,
  FileBarChart,
} from "lucide-react";
import { UserRole } from "@prisma/client";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  allowedRoles?: UserRole[]; // If undefined, visible to all workspace users (ADMINISTRATOR and ACCOUNTANT)
  description?: string;
}

export interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  items: NavItem[];
}

/**
 * Navigation structure grouped into 5 main Admin sections:
 * 1. Overview
 * 2. Master Data
 * 3. Transactions
 * 4. Accounting
 * 5. Reports
 */
export const navSections: NavSection[] = [
  // 1. Overview
  {
    title: "Overview",
    icon: LayoutDashboard,
    description: "System metrics & quick insights",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Real-time key performance metrics",
      },
    ],
  },

  // 2. Master Data
  {
    title: "Master Data",
    icon: Database,
    description: "Core entities, contacts & accounts",
    items: [
      {
        name: "Users",
        href: "/settings/users-management",
        icon: Users,
        allowedRoles: [UserRole.ADMINISTRATOR],
        description: "Manage system access & roles",
      },
      {
        name: "Customers",
        href: "/contacts?type=CUSTOMER",
        icon: Users,
        description: "Customer database & portals",
      },
      {
        name: "Vendors",
        href: "/contacts?type=VENDOR",
        icon: Building,
        description: "Supplier contacts & details",
      },
      {
        name: "Products",
        href: "/products",
        icon: Package,
        description: "Goods, services & inventory items",
      },
      {
        name: "Chart of Accounts",
        href: "/accounts",
        icon: BookOpen,
        description: "GL accounts structure",
      },
      {
        name: "Company Profile",
        href: "/settings/company-profile",
        icon: Settings,
        allowedRoles: [UserRole.ADMINISTRATOR],
        description: "Organization & branding settings",
      },
      {
        name: "Fiscal Year",
        href: "/settings/fiscal-year",
        icon: Settings,
        allowedRoles: [UserRole.ADMINISTRATOR],
        description: "Financial periods & closure rules",
      },
    ],
  },

  // 3. Transactions
  {
    title: "Transactions",
    icon: Layers,
    description: "Sales, purchases & invoicing flows",
    items: [
      {
        name: "Sales Orders",
        href: "/sales",
        icon: ShoppingBag,
        description: "Customer quotes & confirmed orders",
      },
      {
        name: "Customer Invoices",
        href: "/invoices",
        icon: FileText,
        description: "Receivables & billing records",
      },
      {
        name: "Invoice Payments",
        href: "/payments",
        icon: Coins,
        description: "Collected customer payments",
      },
      {
        name: "Purchase Orders",
        href: "/purchases",
        icon: ShoppingCart,
        description: "Vendor procurement orders",
      },
      {
        name: "Vendor Bills",
        href: "/bills",
        icon: Receipt,
        description: "Payables & incoming supplier bills",
      },
      {
        name: "Bill Payments",
        href: "/payments",
        icon: CreditCard,
        description: "Disbursed vendor payments",
      },
    ],
  },

  // 4. Accounting
  {
    title: "Accounting",
    icon: BookText,
    description: "General ledger, entries & budgets",
    items: [
      {
        name: "Journals",
        href: "/journals",
        icon: FileCheck,
        description: "Sales, purchase & bank journals",
      },
      {
        name: "Journal Entries",
        href: "/journal-entries",
        icon: BookText,
        description: "Double-entry accounting records",
      },
      {
        name: "Payments",
        href: "/payments",
        icon: CreditCard,
        description: "All financial transactions",
      },
      {
        name: "Analytic Accounts",
        href: "/analytic-accounts",
        icon: FolderTree,
        description: "Cost centers & project tracking",
      },
      {
        name: "Budgets",
        href: "/budgets",
        icon: PieChart,
        description: "Financial targets & allocations",
      },
    ],
  },

  // 5. Reports
  {
    title: "Reports",
    icon: FileBarChart,
    description: "Financial statements & analytics",
    items: [
      {
        name: "Profit & Loss",
        href: "/reports/profit-loss",
        icon: TrendingUp,
        description: "Income & expense summary statement",
      },
      {
        name: "Balance Sheet",
        href: "/reports/balance-sheet",
        icon: BarChart3,
        description: "Assets, liabilities & equity overview",
      },
      {
        name: "Budget Reports",
        href: "/reports/budget-report",
        icon: PieChart,
        description: "Variance analysis vs budget targets",
      },
    ],
  },
];

/**
 * Filter navigation items based on user role
 *
 * Rules from docs/rbac.md:
 * - ADMINISTRATOR: See everything across Overview, Master Data, Transactions, Accounting, Reports
 * - ACCOUNTANT: See all except User Management and Settings
 * - CONTACT: Portal only (handled in PortalSidebar.tsx)
 */
export function getFilteredNavSections(userRole: UserRole): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(userRole);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
