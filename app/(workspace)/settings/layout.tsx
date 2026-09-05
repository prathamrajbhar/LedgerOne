import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { SettingsLayoutClient } from "@/components/settings/SettingsLayoutClient";

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
    <SettingsLayoutClient userRole={session.user.role}>
      {children}
    </SettingsLayoutClient>
  );
}
