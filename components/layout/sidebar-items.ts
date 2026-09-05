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
} from "lucide-react";
import { UserRole } from "@prisma/client";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  allowedRoles?: UserRole[]; // If undefined, visible to all workspace users
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Sales",
    items: [
      { name: "Sales Orders", href: "/sales", icon: ShoppingBag },
      { name: "Customer Invoices", href: "/invoices", icon: FileText },
      { name: "Receipts", href: "/payments", icon: Coins },
    ],
  },
  {
    title: "Purchase",
    items: [
      { name: "Purchase Orders", href: "/purchases", icon: ShoppingCart },
      { name: "Vendor Bills", href: "/bills", icon: Receipt },
      { name: "Bill Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "Accounting",
    items: [
      { name: "Contacts", href: "/contacts", icon: Users },
      { name: "Products", href: "/products", icon: Package },
      { name: "Chart of Accounts", href: "/accounts", icon: BookOpen },
      { name: "Journals", href: "/journals", icon: FileCheck },
      { name: "Analytic Accounts", href: "/analytic-accounts", icon: FolderTree },
      { name: "Tax Rates", href: "/tax-rates", icon: Receipt },
      { name: "Journal Entries", href: "/journal-entries", icon: BookText },
      { name: "Budgets", href: "/budgets", icon: PieChart },
    ],
  },
  {
    title: "Reports",
    items: [
      { name: "Reports Hub", href: "/reports", icon: BarChart3 },
      { name: "Balance Sheet", href: "/reports/balance-sheet", icon: TrendingUp },
      { name: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart3 },
      { name: "Budget Report", href: "/reports/budget-report", icon: PieChart },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        name: "Users",
        href: "/settings/users",
        icon: ShieldCheck,
        allowedRoles: [UserRole.ADMINISTRATOR] // Admin only
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        allowedRoles: [UserRole.ADMINISTRATOR] // Admin only
      },
    ],
  },
];

/**
 * Filter navigation items based on user role
 */
export function getFilteredNavSections(userRole: UserRole): NavSection[] {
  return navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // If no role restriction, show to all workspace users
      if (!item.allowedRoles) return true;
      // Otherwise check if user's role is in allowed list
      return item.allowedRoles.includes(userRole);
    })
  })).filter(section => section.items.length > 0); // Remove empty sections
}
