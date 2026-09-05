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
  ShieldCheck,
  FolderTree,
  FileCheck,
  Coins,
  UserPlus,
  Layers,
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
 * Complete navigation structure matching docs/rbac.md
 *
 * ADMINISTRATOR: Full system access
 * ACCOUNTANT: Financial and accounting access (no User Management, no Product Categories, no Settings)
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
        href: "/users",
        icon: Users,
        allowedRoles: [UserRole.ADMINISTRATOR]
      },
      {
        name: "Create User",
        href: "/users/create",
        icon: UserPlus,
        allowedRoles: [UserRole.ADMINISTRATOR]
      },
      {
        name: "Roles / Permissions",
        href: "/users/roles",
        icon: ShieldCheck,
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
        name: "Contacts",
        href: "/contacts",
        icon: Users
      },
    ],
  },

  // Products - ADMINISTRATOR and ACCOUNTANT (but Product Categories is Admin-only)
  {
    title: "Products",
    items: [
      {
        name: "Products",
        href: "/products",
        icon: Package
      },
      {
        name: "Product Categories",
        href: "/products/categories",
        icon: Layers,
        allowedRoles: [UserRole.ADMINISTRATOR] // ACCOUNTANT cannot see this
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
        name: "System Settings",
        href: "/settings",
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
 * - ACCOUNTANT: See all except User Management, Product Categories, and Settings
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
