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
  { name: "Purchase", href: "/purchase/orders", icon: ShoppingCart },
  { name: "Sales", href: "/sales/orders", icon: DollarSign },
  { name: "Accounting", href: "/accounting/journal-entries", icon: FileText },
  { name: "Budgets", href: "/budgets", icon: BarChart3 },
  { name: "Reports", href: "/reports/balance-sheet", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center font-bold text-lg text-white">
            L1
          </div>
          <span className="text-xl font-bold tracking-tight">LedgerOne</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-400 text-center">
        LedgerOne v1.0.0
      </div>
    </aside>
  );
}
