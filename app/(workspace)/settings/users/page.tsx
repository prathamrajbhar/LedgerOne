import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getUsersAction, getUninvitedContactsAction } from "@/app/actions/user-management.actions";
import { UsersTable, SystemUser } from "./users-table";
import { CreateUserModal, InviteContactModal } from "./user-modals";
import { Building2, Users } from "lucide-react";

export default async function UserManagementPage() {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-medium">
        <Link
          href="/settings"
          className="pb-3 text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <Building2 className="h-4 w-4" /> Company Profile
        </Link>
        <Link
          href="/settings/users"
          className="pb-3 border-b-2 border-navy text-navy font-bold flex items-center gap-1.5"
        >
          <Users className="h-4 w-4" /> User & Portal Management
        </Link>
      </div>

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
