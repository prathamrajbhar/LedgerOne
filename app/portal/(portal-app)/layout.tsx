import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { UserRole, ContactType } from "@prisma/client";
import PortalLayoutClient from "./portal-layout-client";


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
    <PortalLayoutClient
      contactName={contactName}
      contactType={contactType}
      mustChangePassword={mustChangePassword}
    >
      {children}
    </PortalLayoutClient>
  );
}

