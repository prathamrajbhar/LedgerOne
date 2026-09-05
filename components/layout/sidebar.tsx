"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileText,
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
  Bell,
  Settings,
  ArrowRight,
  Armchair,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Transactions", href: "/transactions", icon: Receipt },
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Expenses", href: "/expenses", icon: Wallet },
      { name: "Journal Entries", href: "/journal-entries", icon: BookText },
      { name: "Accounts", href: "/accounts", icon: BookOpen },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Customers", href: "/contacts", icon: Users },
      { name: "Suppliers", href: "/contacts?type=VENDOR", icon: UserCheck },
      { name: "Products", href: "/products", icon: Package },
      { name: "Inventory", href: "/inventory", icon: Boxes },
    ],
  },
  {
    title: "Sales & Purchases",
    items: [
      { name: "Sales", href: "/sales", icon: ShoppingBag },
      { name: "Purchases", href: "/purchases", icon: ShoppingCart },
    ],
  },
  {
    title: "Analytics",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Financial Reports", href: "/financial-reports", icon: TrendingUp },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell, badge: 3 },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex flex-col justify-center border-b border-border/70 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-navy">
              Ledger<span className="text-teal">One</span>
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-normal -mt-0.5">
            Accounting for a Better Tomorrow
          </span>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-[#E8F0F7] text-navy font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-[#F6F7F9] hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-navy"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-destructive text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Bottom Callout: Furniture Business */}
          <div className="pt-2 px-1">
            <div className="relative overflow-hidden rounded-xl border border-[#D0E2EC] bg-gradient-to-br from-[#EEF5FA] to-[#E5EFF7] p-3.5 text-navy">
              <div className="pr-10">
                <p className="text-[10px] uppercase font-bold tracking-wider text-teal">
                  Industry Focus
                </p>
                <p className="text-xs font-semibold leading-tight text-navy mt-0.5">
                  Manage your <span className="underline decoration-teal">Furniture Business</span> with Confidence
                </p>
              </div>

              <div className="absolute right-2.5 top-3 text-teal/40">
                <Armchair className="h-10 w-10 stroke-[1.5]" />
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">ERP Suite</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white hover:bg-navy-hover transition-colors">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
