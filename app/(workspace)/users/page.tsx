import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getUsersAction, getUninvitedContactsAction } from "@/app/actions/user-management.actions";
import { UsersTable, SystemUser } from "../settings/users/users-table";
import { CreateUserModal, InviteContactModal } from "../settings/users/user-modals";
import { auth } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  const [usersRes, contactsRes] = await Promise.all([
    getUsersAction(),
    getUninvitedContactsAction(),
  ]);

  const paginatedData = usersRes.success && usersRes.data ? usersRes.data : null;
  const initialUsers = (paginatedData?.users || []) as SystemUser[];
  const initialTotal = paginatedData?.total || 0;
  const initialTotalPages = paginatedData?.totalPages || 1;

  const contacts = (contactsRes.success && contactsRes.data ? contactsRes.data : []) as Array<{
    id: string;
    name: string;
    email: string;
    type: string;
  }>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Manage system administrators, staff accountants, and issue client portal credentials."
        actions={
          <div className="flex items-center gap-2">
            <InviteContactModal contacts={contacts} />
            <CreateUserModal />
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
