import * as React from "react";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  FileSpreadsheet,
  CreditCard,
  Wallet,
  BookOpen,
  BookText,
  Users,
  UserCheck,
  Package,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  PieChart,
  Bell,
  Settings,
  ShieldCheck,
  Percent,
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
    title: "Finance & Accounting",
    items: [
      { name: "Transactions", href: "/transactions", icon: Receipt },
      { name: "Customer Invoices", href: "/invoices", icon: FileText },
      { name: "Vendor Bills", href: "/bills", icon: FileCheck },
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Expenses", href: "/expenses", icon: Wallet },
      { name: "Journal Entries", href: "/journal-entries", icon: BookText },
      { name: "Chart of Accounts", href: "/accounts", icon: BookOpen },
      { name: "Accounting Journals", href: "/journals", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Operations & Sales",
    items: [
      { name: "Sales Orders", href: "/sales", icon: ShoppingBag },
      { name: "Purchase Orders", href: "/purchases", icon: ShoppingCart },
      { name: "Customers", href: "/contacts", icon: Users },
      { name: "Suppliers", href: "/contacts?type=VENDOR", icon: UserCheck },
      { name: "Products", href: "/products", icon: Package },
      { name: "Inventory", href: "/inventory", icon: Boxes },
    ],
  },
  {
    title: "Planning & Reports",
    items: [
      { name: "Budgets", href: "/budgets", icon: PieChart },
      { name: "Reports Hub", href: "/reports", icon: BarChart3 },
      { name: "Financial Statements", href: "/financial-reports", icon: TrendingUp },
      { name: "Analytic Accounts", href: "/analytic-accounts", icon: FolderTree },
      { name: "Tax Rates", href: "/tax-rates", icon: Percent },
    ],
  },
  {
    title: "System & Administration",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell, badge: 3 },
      { name: "User Management", href: "/settings/users", icon: ShieldCheck },
      { name: "Company Settings", href: "/settings", icon: Settings },
    ],
  },
];
