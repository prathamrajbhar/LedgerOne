"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredNavSections, NavItem } from "./sidebar-items";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import {
  ChevronRight,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole: UserRole;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Navigation sections filtered by user role
  const allNavSections = React.useMemo(() => {
    return getFilteredNavSections(userRole);
  }, [userRole]);

  // Full current URL for search query matching (e.g. /contacts?type=CUSTOMER)
  const fullCurrentUrl = React.useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  // Search filter state
  const [filterQuery, setFilterQuery] = React.useState("");

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

  // Initialize open categories based on active path
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({});

  // Auto-expand section that contains active route on load or navigation
  React.useEffect(() => {
    const newOpenState: Record<string, boolean> = { ...openCategories };
    let hasActive = false;

    allNavSections.forEach((section) => {
      const hasActiveChild = section.items.some((item) => isItemActive(item));
      if (hasActiveChild) {
        newOpenState[section.title] = true;
        hasActive = true;
      }
    });

    // Default expand Overview if nothing selected yet
    if (!hasActive && Object.keys(newOpenState).length === 0) {
      newOpenState["Overview"] = true;
    }

    setOpenCategories(newOpenState);
  }, [pathname, fullCurrentUrl, allNavSections, isItemActive]);

  // Filter sections based on search query
  const filteredNavSections = React.useMemo(() => {
    if (!filterQuery.trim()) return allNavSections;

    const query = filterQuery.toLowerCase();
    return allNavSections
      .map((section) => {
        const matchesTitle = section.title.toLowerCase().includes(query);
        const matchingItems = section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        );

        if (matchesTitle) return section; // show all items if title matches
        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [allNavSections, filterQuery]);

  // Expand / Collapse section toggle
  const toggleSection = (title: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Expand all / Collapse all toggle
  const isAllOpen = React.useMemo(() => {
    return allNavSections.every((s) => openCategories[s.title]);
  }, [allNavSections, openCategories]);

  const toggleAll = () => {
    const nextState: Record<string, boolean> = {};
    allNavSections.forEach((s) => {
      nextState[s.title] = !isAllOpen;
    });
    setOpenCategories(nextState);
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
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto h-screen shadow-xs select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border/70 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex-shrink-0 rounded-xl bg-white border border-border/70 shadow-2xs overflow-hidden flex items-center justify-center p-0.5">
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
                Accounting ERP Platform
              </span>
            </div>
          </div>

          {/* Role Pill Indicator */}
          <div
            className="flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-navy/5 text-navy border border-navy/15"
            title={`Logged in as ${userRole}`}
          >
            <ShieldCheck className="h-3 w-3 text-teal" />
            <span>{userRole === UserRole.ADMINISTRATOR ? "Admin" : "Accountant"}</span>
          </div>
        </div>

        {/* Quick Filter Search Input & Expand/Collapse Controls */}
        <div className="p-3 border-b border-border/50 bg-[#F8FAFC]/80 space-y-2 flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search sections & links..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-border rounded-lg placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-teal/60 focus:border-teal transition-all shadow-2xs"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[10.5px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-teal" />
              <span>5 Main Modules</span>
            </span>
            <button
              onClick={toggleAll}
              className="text-teal hover:underline font-semibold transition-colors"
            >
              {filterQuery ? "Searching..." : isAllOpen ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2 no-scrollbar">
          {filteredNavSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpenSection = filterQuery ? true : !!openCategories[section.title];
            const activeChildCount = section.items.filter((item) => isItemActive(item)).length;

            return (
              <div
                key={section.title}
                className="rounded-xl border border-navy/5 bg-white/60 overflow-hidden transition-all duration-200"
              >
                {/* Accordion Category Header Button */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold transition-all duration-200 group rounded-xl",
                    activeChildCount > 0
                      ? "bg-navy/5 text-navy"
                      : "text-foreground/80 hover:bg-[#F1F5F9] hover:text-navy"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-colors flex-shrink-0",
                        activeChildCount > 0
                          ? "bg-navy text-white shadow-xs"
                          : "bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white"
                      )}
                    >
                      <SectionIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="truncate tracking-tight font-bold text-xs">
                        {section.title}
                      </span>
                      <span className="text-[9.5px] text-muted-foreground font-normal truncate">
                        {section.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                    <span
                      className={cn(
                        "text-[9.5px] font-bold px-1.5 py-0.5 rounded-md transition-colors",
                        activeChildCount > 0
                          ? "bg-teal text-white shadow-2xs"
                          : "bg-muted/60 text-muted-foreground group-hover:bg-muted"
                      )}
                    >
                      {section.items.length}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground/70 transition-transform duration-200",
                        isOpenSection && "transform rotate-90 text-teal"
                      )}
                    />
                  </div>
                </button>

                {/* Collapsible Animated Sub-Items List */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                    isOpenSection
                      ? "grid-rows-[1fr] opacity-100 py-1"
                      : "grid-rows-[0fr] opacity-0 py-0"
                  )}
                >
                  <div className="overflow-hidden space-y-0.5 px-1.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isItemActive(item);

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-[11.5px] font-medium transition-all duration-200 group relative ml-2",
                            active
                              ? "bg-gradient-to-r from-navy via-[#16324F] to-[#102A43] text-white font-semibold shadow-xs"
                              : "text-muted-foreground hover:bg-[#F1F5F9] hover:text-navy"
                          )}
                        >
                          {/* Glowing Teal Active Indicator Bar */}
                          {active && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal rounded-r-full shadow-[0_0_8px_#00F5D4]" />
                          )}

                          <div className="flex items-center gap-2.5 min-w-0 pl-1">
                            <ItemIcon
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200",
                                active
                                  ? "text-teal-light"
                                  : "text-muted-foreground/70 group-hover:text-teal"
                              )}
                            />
                            <span className="truncate tracking-tight">{item.name}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.2 text-[9.5px] font-bold rounded-full bg-destructive text-white shadow-2xs">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Admin Info */}
        <div className="p-3 border-t border-border/60 bg-[#F8FAFC] flex-shrink-0 flex items-center justify-between text-[10.5px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-teal" />
            <span className="font-semibold text-navy truncate max-w-[130px]">LedgerOne Admin</span>
          </div>
          <span className="text-[9.5px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
            v1.0 Live
          </span>
        </div>
      </aside>
    </>
  );
}
