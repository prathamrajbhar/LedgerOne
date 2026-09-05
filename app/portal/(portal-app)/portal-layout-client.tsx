"use client";

import * as React from "react";
import { useState } from "react";
import PortalHeader from "./components/PortalHeader";
import PortalSidebar from "./components/PortalSidebar";
import { HelpAssistantWidget } from "@/components/help-assistant/chat-widget";
import { ForceChangePasswordModal } from "@/components/auth/force-change-password-modal";
import { ContactType } from "@prisma/client";

interface PortalLayoutClientProps {
  children: React.ReactNode;
  contactName: string;
  contactType: ContactType;
  contactAvatar?: string | null;
  mustChangePassword?: boolean;
}

export default function PortalLayoutClient({
  children,
  contactName,
  contactType,
  contactAvatar,
  mustChangePassword,
}: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <PortalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        contactType={contactType}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <PortalHeader
          contactName={contactName}
          contactType={contactType}
          contactAvatar={contactAvatar}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-7">
          <div className="max-w-[1600px] mx-auto w-full">
            {mustChangePassword ? (
              <div className="h-[60vh] flex items-center justify-center text-muted-foreground text-sm font-medium">
                Action Required: Please set your permanent password to access your portal.
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Help Assistant Widget */}
      {!mustChangePassword && <HelpAssistantWidget />}

      {/* Mandatory Change Password Modal */}
      <ForceChangePasswordModal mustChangePassword={mustChangePassword} />
    </div>
  );
}
