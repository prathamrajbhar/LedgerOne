import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { UserRole, ContactType } from "@prisma/client";
import PortalHeader from "./components/PortalHeader";
import PortalSidebar from "./components/PortalSidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to portal login if not authenticated
  if (!session?.user) {
    redirect("/portal/login");
  }

  // Ensure user is a contact (not admin/accountant)
  if (session.user.role !== UserRole.CONTACT || !session.user.contactId) {
    redirect("/login");
  }

  const contactType = session.user.contactType || ContactType.CUSTOMER;
  const contactName = session.user.contactName || session.user.name || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader contactName={contactName} />
      <div className="flex">
        <PortalSidebar contactType={contactType} />
        <main className="flex-1 ml-64 mt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
