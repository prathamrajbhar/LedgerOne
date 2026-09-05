"use client";

import * as React from "react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { HelpAssistantWidget } from "@/components/help-assistant/chat-widget";
import { ForceChangePasswordModal } from "@/components/auth/force-change-password-modal";
import { UserRole } from "@prisma/client";

interface WorkspaceLayoutClientProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  mustChangePassword?: boolean;
}

export default function WorkspaceLayoutClient({
  children,
  userRole,
  userName,
  userEmail,
  userAvatar,
  mustChangePassword,
}: WorkspaceLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Static / Sticky Top Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-7">
          <div className="max-w-[1600px] mx-auto w-full">
            {mustChangePassword ? (
              <div className="h-[60vh] flex items-center justify-center text-muted-foreground text-sm font-medium">
                Action Required: Please set your permanent password to access your workspace.
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Persistent Help Assistant Chat Widget */}
      {!mustChangePassword && <HelpAssistantWidget />}

      {/* Mandatory Change Password Modal */}
      <ForceChangePasswordModal mustChangePassword={mustChangePassword} />
    </div>
  );
}
