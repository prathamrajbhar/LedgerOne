import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { UserRole } from "@prisma/client";
import WorkspaceLayoutClient from "./workspace-layout-client";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user is Admin or Accountant (not Contact)
  if (session.user.role === UserRole.CONTACT) {
    redirect("/portal/home");
  }

  const userRole = session.user.role;
  const userName = session.user.name || "User";
  const userEmail = session.user.email;

  return (
    <WorkspaceLayoutClient
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
