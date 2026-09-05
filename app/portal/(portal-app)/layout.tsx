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

  let contactAvatar: string | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const contact = await prisma.contact.findUnique({
      where: { id: session.user.contactId },
      select: { profileImage: true },
    });
    contactAvatar = contact?.profileImage || null;
  } catch {
    contactAvatar = null;
  }

  return (
    <PortalLayoutClient
      contactName={contactName}
      contactType={contactType}
      contactAvatar={contactAvatar}
      mustChangePassword={mustChangePassword}
    >
      {children}
    </PortalLayoutClient>
  );
}

