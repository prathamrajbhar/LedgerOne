"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactType } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalSidebarProps {
  contactType: ContactType;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleFor: ContactType[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
    visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
  },
  {
    label: "Invoices",
    href: "/portal/invoices",
    icon: FileText,
    visibleFor: [ContactType.CUSTOMER, ContactType.BOTH],
  },
  {
    label: "Bills",
    href: "/portal/bills",
    icon: Receipt,
    visibleFor: [ContactType.VENDOR, ContactType.BOTH],
  },
  {
    label: "Payments",
    href: "/portal/payments",
    icon: CreditCard,
    visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
  },
  {
    label: "Profile",
    href: "/portal/profile",
    icon: User,
    visibleFor: [ContactType.CUSTOMER, ContactType.VENDOR, ContactType.BOTH],
  },
];

export default function PortalSidebar({ contactType }: PortalSidebarProps) {
  const pathname = usePathname();

  // Filter menu items based on contact type
  const visibleItems = menuItems.filter((item) =>
    item.visibleFor.includes(contactType)
  );

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-border shadow-sm">
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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
      <div className="absolute bottom-4 left-4 right-4">
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
