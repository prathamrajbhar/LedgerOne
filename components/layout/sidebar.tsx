"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredNavSections, NavItem } from "./sidebar-items";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole: UserRole;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Navigation sections filtered by user role
  const navSections = React.useMemo(() => {
    return getFilteredNavSections(userRole);
  }, [userRole]);

  // Full current URL for query param matching (e.g. /contacts?type=CUSTOMER)
  const fullCurrentUrl = React.useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  // Helper to check if item is active
  const isItemActive = React.useCallback(
    (item: NavItem) => {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
      }
      if (item.href.includes("?")) {
        return fullCurrentUrl === item.href;
      }
      return (
        pathname === item.href ||
        (pathname.startsWith(item.href + "/") && !item.href.includes("?"))
      );
    },
    [pathname, fullCurrentUrl]
  );

  // Accordion state: keep track of open sections
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  // Auto-expand section that contains the active route
  React.useEffect(() => {
    const newOpenState: Record<string, boolean> = { ...openSections };
    let hasActive = false;

    navSections.forEach((section) => {
      const hasActiveChild = section.items.some((item) => isItemActive(item));
      if (hasActiveChild) {
        newOpenState[section.title] = true;
        hasActive = true;
      }
    });

    if (!hasActive && Object.keys(newOpenState).length === 0) {
      newOpenState["Overview"] = true;
    }

    setOpenSections(newOpenState);
  }, [pathname, fullCurrentUrl, navSections, isItemActive]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto h-screen select-none",
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
              Accounting for a Better Tomorrow
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Sections (Simple & Clean) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpenSection = !!openSections[section.title];
            const hasActiveChild = section.items.some((item) => isItemActive(item));

            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header Button */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full px-2 py-1.5 flex items-center justify-between text-xs font-normal transition-colors rounded-md group",
                    hasActiveChild
                      ? "text-navy"
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-[#F6F7F9]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-3.5 w-3.5 text-teal" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                      isOpenSection && "transform rotate-90 text-navy"
                    )}
                  />
                </button>

                {/* Sub-items List (Collapsible) */}
                {isOpenSection && (
                  <div className="space-y-0.5 pl-2">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isItemActive(item);

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-normal transition-all group",
                            active
                              ? "bg-[#E8F0F7] text-navy font-medium shadow-2xs"
                              : "text-muted-foreground hover:bg-[#F6F7F9] hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <ItemIcon
                              className={cn(
                                "h-4 w-4 transition-colors",
                                active
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
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
