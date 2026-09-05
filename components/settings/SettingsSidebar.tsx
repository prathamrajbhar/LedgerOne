"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  ShieldCheck,
  KeyRound,
  Lock,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface SettingsSidebarProps {
  userRole?: UserRole | string;
}

interface SettingsNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  adminOnly?: boolean;
  disabled?: boolean;
  badge?: string;
}

export function SettingsSidebar({ userRole }: SettingsSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMINISTRATOR";

  const navItems: SettingsNavItem[] = [
    {
      title: "Company Profile",
      href: "/settings/company-profile",
      icon: Building2,
      description: "Business name, logo & base currency",
    },
    {
      title: "Fiscal Year & Numbering",
      href: "/settings/fiscal-year",
      icon: CalendarDays,
      description: "Document prefixes & accounting period",
    },
    {
      title: "Users Management",
      href: "/settings/users-management",
      icon: ShieldCheck,
      description: "Staff accounts & portal permissions",
      adminOnly: true,
    },
    {
      title: "API & Integrations",
      href: "#",
      icon: KeyRound,
      description: "API keys & external services",
      disabled: true,
      badge: "Soon",
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <nav className="w-full lg:w-64 shrink-0 space-y-1">
      <div className="px-3 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          Settings
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Workspace administration
        </p>
      </div>

      <div className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/settings/company-profile" && pathname === "/settings");

          if (item.disabled) {
            return (
              <div
                key={item.title}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground/50 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <div>
                    <span className="block font-semibold">{item.title}</span>
                    <span className="block text-[10px]">{item.description}</span>
                  </div>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group",
                isActive
                  ? "bg-white text-navy font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0",
                    isActive
                      ? "bg-[#E8F0F7] text-navy"
                      : "bg-surface-subtle text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">
                      {item.title}
                    </span>
                    {item.adminOnly && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className="block text-[10px] text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
