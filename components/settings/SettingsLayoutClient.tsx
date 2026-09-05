"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SettingsSidebar } from "./SettingsSidebar";
import { UserRole } from "@prisma/client";

interface SettingsLayoutClientProps {
  children: React.ReactNode;
  userRole?: UserRole | string;
}

export function SettingsLayoutClient({
  children,
  userRole,
}: SettingsLayoutClientProps) {
  const pathname = usePathname();
  const isFiscalYear = pathname?.includes("/settings/fiscal-year");

  // In fiscal year, remove the "Settings / Workspace administration" sidebar section
  if (isFiscalYear) {
    return <div className="w-full min-w-0">{children}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Settings Sidebar */}
        <SettingsSidebar userRole={userRole} />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
