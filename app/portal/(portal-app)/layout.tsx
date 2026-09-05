import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { UserRole, ContactType } from "@prisma/client";
import PortalHeader from "./components/PortalHeader";
import PortalSidebar from "./components/PortalSidebar";
import { HelpAssistantWidget } from "@/components/help-assistant/chat-widget";
import { ForceChangePasswordModal } from "@/components/auth/force-change-password-modal";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to unified login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user is a contact (not admin/accountant)
  if (session.user.role !== UserRole.CONTACT || !session.user.contactId) {
    redirect("/login");
  }

  const contactType = session.user.contactType || ContactType.CUSTOMER;
  const contactName = session.user.contactName || session.user.name || "User";
  const mustChangePassword = Boolean(session.user.mustChangePassword);

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader contactName={contactName} />
      <div className="flex">
        <PortalSidebar contactType={contactType} />
        <main className="flex-1 ml-64 mt-16 p-6">
          {mustChangePassword ? (
            <div className="h-[60vh] flex items-center justify-center text-muted-foreground text-sm font-medium">
              Action Required: Please set your permanent password to access your portal.
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Help Assistant Widget - Only active after password set */}
      {!mustChangePassword && <HelpAssistantWidget />}

      {/* Mandatory Change Password Modal */}
      <ForceChangePasswordModal mustChangePassword={mustChangePassword} />
    </div>
  );
}
