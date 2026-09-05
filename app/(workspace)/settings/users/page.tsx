import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/lib/services/user.service";
import { CreateUserDialog } from "./create-user-dialog";
import { InviteContactDialog } from "./invite-contact-dialog";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const users = await userService.list();

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="User & Access Management"
        description="Administrators, Accountants, and Contact Portal users."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Settings
              </Button>
            </Link>
            <InviteContactDialog />
            <CreateUserDialog />
          </div>
        }
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Registered Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Login ID</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Email</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Linked Contact</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {u.name || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">
                      {u.loginId}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        u.role === "ADMINISTRATOR"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "ACCOUNTANT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {u.contact?.name ? (
                        <span className="font-medium text-gray-800">
                          {u.contact.name} ({u.contact.type})
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                        u.isActive ? "bg-emerald-500" : "bg-gray-300"
                      }`} title={u.isActive ? "Active" : "Inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
