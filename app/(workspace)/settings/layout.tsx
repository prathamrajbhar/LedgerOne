import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Settings is restricted to Administrators only
  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Settings Sidebar */}
        <SettingsSidebar userRole={session.user.role} />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
