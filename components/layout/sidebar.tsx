"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredNavSections } from "./sidebar-items";
import { UserRole } from "@prisma/client";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole: UserRole;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get filtered navigation based on user role
  const navSections = React.useMemo(() => {
    return getFilteredNavSections(userRole);
  }, [userRole]);

  const fullCurrentUrl = React.useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

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
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : item.href.includes("?")
                    ? fullCurrentUrl === item.href
                    : pathname === item.href || (pathname.startsWith(item.href + "/") && !item.href.includes("?"));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-[#E8F0F7] text-navy font-semibold shadow-xs"
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
        </div>
      </aside>
    </>
  );
}
