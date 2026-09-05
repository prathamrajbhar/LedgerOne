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
} from "lucide-react";
import { UserRole } from "@prisma/client";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  allowedRoles?: UserRole[]; // If undefined, visible to all workspace users (ADMINISTRATOR and ACCOUNTANT)
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * Navigation structure aligned with actual file structure and docs/rbac.md
 *
 * ADMINISTRATOR: Full system access
 * ACCOUNTANT: Financial and accounting access (no User Management, no Settings)
 * CONTACT: Portal only (handled separately in PortalSidebar.tsx)
 */
export const navSections: NavSection[] = [
  // Dashboard - visible to all workspace users
  {
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
      },
    ],
  },

  // User Management - ADMINISTRATOR only
  {
    title: "User Management",
    items: [
      {
        name: "Users",
        href: "/settings/users-management",
        icon: Users,
        allowedRoles: [UserRole.ADMINISTRATOR]
      },
    ],
  },

  // Contacts - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Contacts",
    items: [
      {
        name: "Customers",
        href: "/contacts/customers",
        icon: Users
      },
      {
        name: "Vendors",
        href: "/contacts/vendors",
        icon: Building
      },
      {
        name: "All Contacts",
        href: "/contacts",
        icon: Users
      },
    ],
  },

  // Products - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Products",
    items: [
      {
        name: "Products",
        href: "/products",
        icon: Package
      },
    ],
  },

  // Accounting - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Accounting",
    items: [
      {
        name: "Chart of Accounts",
        href: "/accounts",
        icon: BookOpen
      },
      {
        name: "Journals",
        href: "/journals",
        icon: FileCheck
      },
      {
        name: "Journal Entries",
        href: "/journal-entries",
        icon: BookText
      },
      {
        name: "Payments",
        href: "/payments",
        icon: CreditCard
      },
      {
        name: "Analytic Accounts",
        href: "/analytic-accounts",
        icon: FolderTree
      },
    ],
  },

  // Sales - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Sales",
    items: [
      {
        name: "Sales Orders",
        href: "/sales/orders",
        icon: ShoppingBag
      },
      {
        name: "Customer Invoices",
        href: "/sales/invoices",
        icon: FileText
      },
      {
        name: "Invoice Payments",
        href: "/sales/payments",
        icon: Coins
      },
    ],
  },

  // Purchase - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Purchase",
    items: [
      {
        name: "Purchase Orders",
        href: "/purchase/orders",
        icon: ShoppingCart
      },
      {
        name: "Vendor Bills",
        href: "/purchase/bills",
        icon: Receipt
      },
      {
        name: "Bill Payments",
        href: "/purchase/payments",
        icon: CreditCard
      },
    ],
  },

  // Budget - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Budget",
    items: [
      {
        name: "Budgets",
        href: "/budgets",
        icon: PieChart
      },
      {
        name: "Budget Reports",
        href: "/budgets/reports",
        icon: BarChart3
      },
    ],
  },

  // Reports - ADMINISTRATOR and ACCOUNTANT
  {
    title: "Reports",
    items: [
      {
        name: "Profit & Loss",
        href: "/reports/profit-loss",
        icon: TrendingUp
      },
      {
        name: "Balance Sheet",
        href: "/reports/balance-sheet",
        icon: BarChart3
      },
      {
        name: "Budget Report",
        href: "/reports/budget",
        icon: PieChart
      },
    ],
  },

  // Settings - ADMINISTRATOR only
  {
    title: "Settings",
    items: [
      {
        name: "Company Profile",
        href: "/settings/company-profile",
        icon: Settings,
        allowedRoles: [UserRole.ADMINISTRATOR]
      },
      {
        name: "Fiscal Year",
        href: "/settings/fiscal-year",
        icon: Settings,
        allowedRoles: [UserRole.ADMINISTRATOR]
      },
    ],
  },
];

/**
 * Filter navigation items based on user role
 *
 * Rules from docs/rbac.md:
 * - ADMINISTRATOR: See everything
 * - ACCOUNTANT: See all except User Management and Settings
 * - CONTACT: Portal only (not handled here)
 */
export function getFilteredNavSections(userRole: UserRole): NavSection[] {
  return navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no role restriction, show to all workspace users (ADMINISTRATOR and ACCOUNTANT)
        if (!item.allowedRoles) return true;
        // Otherwise check if user's role is in allowed list
        return item.allowedRoles.includes(userRole);
      })
    }))
    .filter(section => section.items.length > 0); // Remove empty sections
}
