import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Mail, UserPlus } from "lucide-react";
import { getUsersAction } from "@/app/actions/user-management.actions";
import { UsersTable, SystemUser } from "../settings/users/users-table";
import { auth } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  const usersRes = await getUsersAction();

  const paginatedData = usersRes.success && usersRes.data ? usersRes.data : null;
  const initialUsers = (paginatedData?.users || []) as SystemUser[];
  const initialTotal = paginatedData?.total || 0;
  const initialTotalPages = paginatedData?.totalPages || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Manage system administrators, staff accountants, and issue client portal credentials."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/users/invite">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
                <Mail className="h-3.5 w-3.5" /> Invite Client / Vendor
              </Button>
            </Link>
            <Link href="/users/new">
              <Button size="sm" className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5 cursor-pointer">
                <UserPlus className="h-3.5 w-3.5" /> Create Staff Account
              </Button>
            </Link>
          </div>
        }
      />

      <UsersTable
        initialUsers={initialUsers}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
        currentUserId={session.user.id}
      />
    </div>
  );
}
