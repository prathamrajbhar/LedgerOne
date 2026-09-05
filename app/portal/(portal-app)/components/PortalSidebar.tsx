"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactType } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  History,
  User,
  LogOut,
  Building2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface PortalSidebarProps {
  contactType: ContactType;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleFor: ContactType[];
  isAction?: boolean;
  action?: () => void;
}

export default function PortalSidebar({
  contactType,
  isOpen = false,
  onClose,
}: PortalSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: "/portal/dashboard",
      icon: LayoutDashboard,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },
    {
      label: "My Billing",
      href: "/portal/billing",
      icon: CreditCard,
      visibleFor: [ContactType.CUSTOMER, ContactType.BOTH],
    },
    {
      label: "My Bills",
      href: "/portal/bills",
      icon: Receipt,
      visibleFor: [ContactType.VENDOR, ContactType.BOTH],
    },
    {
      label: "Payment History",
      href: "/portal/payments",
      icon: History,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },
    {
      label: "Profile",
      href: "/portal/profile",
      icon: User,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },
    {
      label: "Logout",
      href: "#",
      icon: LogOut,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
      isAction: true,
      action: handleLogout,
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.visibleFor.includes(contactType)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-border/70 flex-shrink-0 bg-white">
          <div className="relative w-9 h-9 flex-shrink-0 rounded-xl bg-white border border-border/60 shadow-2xs overflow-hidden flex items-center justify-center p-0.5">
            <Image
              src="/logo.png"
              alt="LedgerOne Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold tracking-tight text-navy">
                Ledger<span className="text-teal">One</span>
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-normal block -mt-0.5">
              Customer & Partner Portal
            </span>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Portal Menu
            </div>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal/dashboard"
                  ? pathname === "/portal/dashboard" || pathname === "/portal"
                  : pathname === item.href || (pathname.startsWith(item.href + "/") && !item.href.includes("?"));

              if (item.isAction && item.action) {
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all text-left group"
                  >
                    <Icon className="h-4 w-4 text-destructive" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-[#E8F0F7] text-navy font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-[#F6F7F9] hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-navy"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contact Type / Account Badge at bottom */}
        <div className="p-3 border-t border-border/70 bg-[#F8FAFC]">
          <div className="rounded-lg p-2.5 border border-border bg-white flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
              {contactType === ContactType.VENDOR ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Account Type</p>
              <p className="text-xs font-bold text-navy capitalize truncate">
                {contactType.toLowerCase()} Partner
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
