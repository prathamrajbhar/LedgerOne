import { requirePortalAuth } from "@/lib/auth/portal-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";
import { prisma } from "@/lib/prisma";

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
          loginId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!contact) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Profile</h1>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal to-teal-hover flex items-center justify-center text-white text-2xl font-bold">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">{contact.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {contact.type.toLowerCase()} Account
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-teal mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{contact.email}</p>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teal mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-teal mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Address</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 whitespace-pre-line">
                      {contact.address}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-teal mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Account Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                    {contact.type.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-teal mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Login ID</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {contact.user?.loginId || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {new Date(contact.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {contact.user && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Portal Access Since</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(contact.user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Need to update your information?</h3>
              <p className="text-sm text-gray-700">
                Please contact your account manager or the company administrator to update your
                contact details, phone number, or address.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
