"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactType } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  History,
  User,
  LogOut,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface PortalSidebarProps {
  contactType: ContactType;
}

interface PortalMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleFor: ContactType[];
  isAction?: boolean;
  action?: () => void;
}

interface PortalSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: PortalMenuItem[];
}

export default function PortalSidebar({ contactType }: PortalSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Grouped sections for vendor/client portal users
  const portalSections: PortalSection[] = React.useMemo(() => {
    const rawSections = [
      {
        title: "Overview",
        icon: LayoutDashboard,
        items: [
          {
            label: "Dashboard",
            href: "/portal/dashboard",
            icon: LayoutDashboard,
            visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
          },
        ],
      },
      {
        title: "Transactions",
        icon: Layers,
        items: [
          {
            label: "My Invoices",
            href: "/portal/invoices",
            icon: FileText,
            visibleFor: [ContactType.CUSTOMER, ContactType.BOTH],
          },
          {
            label: "My Bills",
            href: "/portal/bills",
            icon: Receipt,
            visibleFor: [ContactType.VENDOR, ContactType.BOTH],
          },
          {
            label: "Payments",
            href: "/portal/payments",
            icon: History,
            visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
          },
        ],
      },
      {
        title: "Account",
        icon: User,
        items: [
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
        ],
      },
    ];

    return rawSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.visibleFor.includes(contactType)),
      }))
      .filter((section) => section.items.length > 0);
  }, [contactType]);

  // Section collapse state
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    Overview: true,
    Transactions: true,
    Account: true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-border shadow-2xs flex flex-col select-none">
      <nav className="flex-1 p-3 overflow-y-auto space-y-3">
        {portalSections.map((section) => {
          const SectionIcon = section.icon;
          const isOpenSection = !!openSections[section.title];
          const hasActiveChild = section.items.some((item) => pathname === item.href);

          return (
            <div key={section.title} className="space-y-1">
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

              {isOpenSection && (
                <div className="space-y-0.5 pl-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.isAction && item.action) {
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal transition-all group",
                          isActive
                            ? "bg-[#E8F0F7] text-navy font-medium shadow-2xs"
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
              )}
            </div>
          );
        })}
      </nav>

      {/* Contact Type Badge */}
      <div className="p-3 border-t border-border bg-[#F8FAFC]">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-border/60 text-xs">
          <span className="text-[11px] font-normal text-muted-foreground">Portal Access</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20 capitalize">
            {contactType.toLowerCase()}
          </span>
        </div>
      </div>
    </aside>
  );
}
