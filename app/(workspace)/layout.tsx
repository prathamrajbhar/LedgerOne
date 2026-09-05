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
    redirect("/portal/dashboard");
  }

  const userRole = session.user.role;
  const userName = session.user.name || "User";
  const userEmail = session.user.email;
  const mustChangePassword = Boolean(session.user.mustChangePassword);

  // Fetch current avatar from DB
  let userAvatar: string | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: { select: { profileImage: true } } },
    });
    userAvatar =
      (dbUser as unknown as { avatarUrl?: string | null })?.avatarUrl ||
      dbUser?.contact?.profileImage ||
      null;
  } catch {
    userAvatar = null;
  }

  return (
    <WorkspaceLayoutClient
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
      userAvatar={userAvatar}
      mustChangePassword={mustChangePassword}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
