"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactType } from "@prisma/client";
import {
  LayoutDashboard,
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

/**
 * Portal Sidebar per docs/rbac.md
 *
 * User/Contact Sidebar:
 * - Dashboard (limited)
 * - My Invoices (Customer only or Both)
 * - My Bills (Vendor only or Both)
 * - Payments (Payment History)
 * - Profile
 * - Logout
 */
export default function PortalSidebar({ contactType }: PortalSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/portal/login" });
  };

  // Build menu structure per docs/rbac.md
  const menuItems: MenuItem[] = [
    // Dashboard - always visible (limited for portal users)
    {
      label: "Dashboard",
      href: "/portal/home",
      icon: LayoutDashboard,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },

    // My Invoices - Customer only or Both
    {
      label: "My Invoices",
      href: "/portal/invoices",
      icon: FileText,
      visibleFor: [ContactType.CUSTOMER, ContactType.BOTH],
    },

    // My Bills - Vendor only or Both
    {
      label: "My Bills",
      href: "/portal/bills",
      icon: Receipt,
      visibleFor: [ContactType.VENDOR, ContactType.BOTH],
    },

    // Payments - always visible (payment history)
    {
      label: "Payments",
      href: "/portal/payments",
      icon: History,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },

    // Profile - always visible
    {
      label: "Profile",
      href: "/portal/profile",
      icon: User,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
    },

    // Logout - always visible
    {
      label: "Logout",
      href: "#",
      icon: LogOut,
      visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
      isAction: true,
      action: handleLogout,
    },
  ];

  // Filter menu items based on contact type
  const visibleItems = menuItems.filter((item) =>
    item.visibleFor.includes(contactType)
  );

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-border shadow-sm flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
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
