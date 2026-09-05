import * as React from "react";
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
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
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
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
    title: "Transactions",
    items: [
      { name: "Sales Orders", href: "/sales", icon: ShoppingBag },
      { name: "Customer Invoices", href: "/invoices", icon: FileText },
      { name: "Purchase Orders", href: "/purchases", icon: ShoppingCart },
      { name: "Vendor Bills", href: "/bills", icon: FileCheck },
      { name: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "Master Data",
    items: [
      { name: "Contacts", href: "/contacts", icon: Users },
      { name: "Products", href: "/products", icon: Package },
      { name: "Chart of Accounts", href: "/accounts", icon: BookOpen },
      { name: "Journals", href: "/journals", icon: FileSpreadsheet },
      { name: "Journal Entries", href: "/journal-entries", icon: BookText },
    ],
  },
  {
    title: "Budgets & Analytic",
    items: [
      { name: "Budgets", href: "/budgets", icon: PieChart },
      { name: "Analytic Accounts", href: "/analytic-accounts", icon: FolderTree },
    ],
  },
  {
    title: "Reports",
    items: [
      { name: "Reports Hub", href: "/reports", icon: BarChart3 },
      { name: "Balance Sheet", href: "/reports/balance-sheet", icon: TrendingUp },
      { name: "Profit & Loss", href: "/reports/profit-loss", icon: FileSpreadsheet },
      { name: "Budget Report", href: "/reports/budget-report", icon: PieChart },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", href: "/settings/users", icon: ShieldCheck },
      { name: "Company Settings", href: "/settings", icon: Settings },
    ],
  },
];
