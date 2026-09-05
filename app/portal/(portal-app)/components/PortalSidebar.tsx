"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactType } from "@prisma/client";
import {
  Home,
  FileText,
  Receipt,
  History,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface PortalSidebarProps {
  contactType: ContactType;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleFor: ContactType[];
  isAction?: boolean;
  action?: () => void;
}

export default function PortalSidebar({ contactType }: PortalSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/portal/login" });
  };

  // Always visible items
  const alwaysVisibleItems: MenuItem[] = [
    {
      label: "Portal Home",
      href: "/portal/home",
      icon: Home,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },
    {
      label: "Payment History",
      href: "/portal/payments",
      icon: History,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },
  ];

  // Customer-specific items
  const customerItems: MenuItem[] = [
    {
      label: "My Invoices",
      href: "/portal/invoices",
      icon: FileText,
      visibleFor: [ContactType.CUSTOMER, ContactType.BOTH],
    },
  ];

  // Vendor-specific items
  const vendorItems: MenuItem[] = [
    {
      label: "My Bills",
      href: "/portal/bills",
      icon: Receipt,
      visibleFor: [ContactType.VENDOR, ContactType.BOTH],
    },
  ];

  // Profile and logout (always visible)
  const bottomItems: MenuItem[] = [
    {
      label: "My Profile",
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

  // Build menu structure
  const menuItems: MenuItem[] = [
    ...alwaysVisibleItems,
    ...customerItems.filter((item) => item.visibleFor.includes(contactType)),
    ...vendorItems.filter((item) => item.visibleFor.includes(contactType)),
    ...bottomItems,
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-border shadow-sm flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction && item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  item.label === "Logout"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal/10 text-teal"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Contact Type Badge */}
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 border border-teal-200">
          <p className="text-xs font-semibold text-teal-800">Account Type</p>
          <p className="text-sm font-bold text-teal-900 capitalize">
            {contactType.toLowerCase()}
          </p>
        </div>
      </div>
    </aside>
  );
}
