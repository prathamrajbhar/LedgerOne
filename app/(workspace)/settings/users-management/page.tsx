import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getUsersAction, getUninvitedContactsAction } from "@/app/actions/user-management.actions";
import { UsersTable, SystemUser } from "../users/users-table";
import { CreateUserModal, InviteContactModal } from "../users/user-modals";

export default async function UsersManagementPage() {
  const [usersRes, contactsRes] = await Promise.all([
    getUsersAction(),
    getUninvitedContactsAction(),
  ]);

  const users = (usersRes.success && usersRes.data ? usersRes.data : []) as SystemUser[];
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

      <UsersTable users={users} />
    </div>
  );
}
