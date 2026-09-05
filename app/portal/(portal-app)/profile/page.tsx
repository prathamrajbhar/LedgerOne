import { requirePortalAuth } from "@/lib/auth/portal-session";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { PortalProfileClient } from "./portal-profile-client";

export default async function PortalProfilePage() {
  const portalSession = await requirePortalAuth();

  // Fetch full contact details
  const contact = await prisma.contact.findUnique({
    where: {
      id: portalSession.contactId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      email: true,
      phone: true,
      address: true,
      profileImage: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          loginId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!contact) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Contact information not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initialProfile = {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    type: contact.type,
    profileImage: contact.profileImage,
    bannerUrl: (contact as unknown as { bannerUrl?: string | null })?.bannerUrl || null,
    createdAt: contact.createdAt.toISOString(),
    user: contact.user
      ? {
          id: contact.user.id,
          loginId: contact.user.loginId,
          createdAt: contact.user.createdAt.toISOString(),
        }
      : null,
  };

  return <PortalProfileClient initialProfile={initialProfile} />;
}
