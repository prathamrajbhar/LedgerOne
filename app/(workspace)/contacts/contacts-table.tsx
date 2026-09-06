"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Mail, Archive, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  archiveContactAction,
  restoreContactAction,
  deleteContactAction,
  getContactUsageDetailsAction,
  deleteContactDependencyAction,
} from "@/app/actions/contact.actions";
import { inviteContactToPortalAction } from "@/app/actions/user-management.actions";
import {
  DestructiveConfirmDialog,
  ConfirmActionType,
  UsageDetails,
} from "@/components/ui/destructive-confirm-dialog";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";

export interface ContactItem {
  id: string;
  name: string;
  type: "CUSTOMER" | "VENDOR" | "BOTH";
  email: string;
  phone?: string | null;
  address?: string | null;
  outstandingBalance?: number;
  totalTransactions?: number;
  isArchived?: boolean;
  userId?: string | null;
  hasPortalAccess?: boolean;
}

interface ContactsTableProps {
  contacts: ContactItem[];
  isArchivedTab?: boolean;
  onInvitePortal?: (contact: ContactItem) => void;
  onRefresh?: () => void;
}

export function ContactsTable({ contacts, isArchivedTab = false, onInvitePortal, onRefresh }: ContactsTableProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMINISTRATOR;

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: ConfirmActionType;
    contact: ContactItem | null;
    isReferenced: boolean;
    checkingUsage: boolean;
    usageDetails: UsageDetails | null;
  }>({
    open: false,
    type: "archive",
    contact: null,
    isReferenced: false,
    checkingUsage: false,
    usageDetails: null,
  });

  const handleOpenDialog = async (type: ConfirmActionType, contact: ContactItem) => {
    if (type === "delete") {
      setConfirmDialog({
        open: true,
        type: "delete",
        contact,
        isReferenced: false,
        checkingUsage: true,
        usageDetails: null,
      });

      const res = await getContactUsageDetailsAction(contact.id);
      if (res.success && res.data) {
        const details = res.data;
        setConfirmDialog((prev) => ({
          ...prev,
          isReferenced: !details.canDelete,
          usageDetails: details,
          checkingUsage: false,
        }));
      } else {
        setConfirmDialog((prev) => ({
          ...prev,
          checkingUsage: false,
        }));
      }
    } else {
      setConfirmDialog({
        open: true,
        type,
        contact,
        isReferenced: false,
        checkingUsage: false,
        usageDetails: null,
      });
    }
  };

  const handleDeleteDependency = async (type: string, id: string, _lineId?: string) => {
    if (!confirmDialog.contact) return;
    const res = await deleteContactDependencyAction(type, id);
    if (res.success) {
      toast.success("Linked reference removed");
      const refreshed = await getContactUsageDetailsAction(confirmDialog.contact.id);
      if (refreshed.success && refreshed.data) {
        const details = refreshed.data;
        setConfirmDialog((prev) => ({
          ...prev,
          isReferenced: !details.canDelete,
          usageDetails: details,
        }));
      }
      onRefresh?.();
    } else {
      toast.error(res.error || "Failed to remove linked document");
    }
  };

  const handleExecuteAction = async () => {
    if (!confirmDialog.contact) return;
    const { id, name } = confirmDialog.contact;

    if (confirmDialog.type === "archive" || (confirmDialog.type === "delete" && !isArchivedTab && confirmDialog.isReferenced)) {
      const res = await archiveContactAction(id);
      if (res.success) {
        toast.success(`Contact "${name}" archived successfully`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to archive contact");
      }
    } else if (confirmDialog.type === "restore") {
      const res = await restoreContactAction(id);
      if (res.success) {
        toast.success(`Contact "${name}" restored successfully`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to restore contact");
      }
    } else if (confirmDialog.type === "delete") {
      const res = await deleteContactAction(id);
      if (res.success) {
        toast.success(`Contact "${name}" deleted permanently`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to delete contact");
      }
    }
  };

  type ContactSortColumn = "name" | "type" | "portal" | "phone" | "address" | "outstandingBalance";
  const { sortedItems: sortedContacts, sortState, handleSort } = useTableSort<ContactItem, ContactSortColumn>(
    contacts,
    "name",
    "asc",
    {
      name: (c) => c.name,
      type: (c) => c.type,
      portal: (c) => (c.hasPortalAccess ? 1 : 0),
      phone: (c) => c.phone || "",
      address: (c) => c.address || "",
      outstandingBalance: (c) => Number(c.outstandingBalance || 0),
    }
  );

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <SortableTableHead columnKey="name" currentSort={sortState} onSort={handleSort}>
                Contact
              </SortableTableHead>
              <SortableTableHead columnKey="type" currentSort={sortState} onSort={handleSort}>
                Type
              </SortableTableHead>
              <SortableTableHead columnKey="portal" currentSort={sortState} onSort={handleSort}>
                Portal Access
              </SortableTableHead>
              <SortableTableHead columnKey="phone" currentSort={sortState} onSort={handleSort}>
                Phone
              </SortableTableHead>
              <SortableTableHead columnKey="address" currentSort={sortState} onSort={handleSort}>
                Address
              </SortableTableHead>
              <SortableTableHead columnKey="outstandingBalance" currentSort={sortState} onSort={handleSort} align="right">
                Outstanding
              </SortableTableHead>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {sortedContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  No contacts found.
                </td>
              </tr>
            ) : (
              sortedContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-primary-light/30 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-light text-navy font-bold text-xs border border-navy/10 flex-shrink-0">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-semibold text-foreground hover:text-navy hover:underline block"
                        >
                          {contact.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        contact.type === "CUSTOMER"
                          ? "default"
                          : contact.type === "VENDOR"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {contact.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    {contact.hasPortalAccess ? (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        ✓ Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                        No Access
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {contact.phone || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                    {contact.address || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{contact.outstandingBalance?.toLocaleString("en-IN") || "0.00"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}/edit`}>Edit Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            if (onInvitePortal) {
                              onInvitePortal(contact);
                            } else {
                              toast.loading("Generating credentials & sending invitation...", { id: `invite-${contact.id}` });
                              try {
                                const res = await inviteContactToPortalAction(contact.id);
                                if (res.success && res.data) {
                                  const inv = res.data as { loginId: string; temporaryPassword: string; emailSent?: boolean; emailError?: string };
                                  if (inv.emailSent) {
                                    toast.success(`Portal invite & credentials emailed to ${contact.email}!`, { id: `invite-${contact.id}` });
                                  } else {
                                    toast.warning(`Portal activated (Login: ${inv.loginId}, Pass: ${inv.temporaryPassword}). Email delivery failed: ${inv.emailError}`, { id: `invite-${contact.id}`, duration: 8000 });
                                  }
                                  onRefresh?.();
                                } else {
                                  toast.error(res.error || "Failed to invite to portal", { id: `invite-${contact.id}` });
                                }
                              } catch {
                                toast.error("An error occurred while inviting contact", { id: `invite-${contact.id}` });
                              }
                            }
                          }}
                        >
                          Invite to Portal
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {contact.isArchived ? (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("restore", contact)}
                            className="text-navy gap-2"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore Contact
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("archive", contact)}
                            className="text-amber-700 gap-2"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archive Contact
                          </DropdownMenuItem>
                        )}

                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("delete", contact)}
                            className="text-destructive focus:text-destructive gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Permanently
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog.contact && (
        <DestructiveConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
          actionType={confirmDialog.type}
          recordName={confirmDialog.contact.name}
          recordType="Contact"
          isReferenced={confirmDialog.isReferenced}
          checkingUsage={confirmDialog.checkingUsage}
          usageDetails={confirmDialog.usageDetails}
          isArchivedTab={isArchivedTab}
          onDeleteDependency={handleDeleteDependency}
          onConfirm={handleExecuteAction}
        />
      )}
    </div>
  );
}
