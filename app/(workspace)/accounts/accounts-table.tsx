"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, RotateCcw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  archiveAccountAction,
  restoreAccountAction,
  deleteAccountAction,
} from "@/app/actions/master-data.actions";
import {
  DestructiveConfirmDialog,
  ConfirmActionType,
} from "@/components/ui/destructive-confirm-dialog";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type:
    | "ASSET"
    | "LIABILITY"
    | "BANK"
    | "CAPITAL"
    | "CASH"
    | "INCOME"
    | "EXPENSES"
    | "OTHER_EXPENSES";
  isArchived: boolean;
}

interface AccountsTableProps {
  accounts: AccountItem[];
  onRefresh?: () => void;
}

export function AccountsTable({ accounts, onRefresh }: AccountsTableProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMINISTRATOR;

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: ConfirmActionType;
    account: AccountItem | null;
  }>({
    open: false,
    type: "archive",
    account: null,
  });

  const handleExecuteAction = async () => {
    if (!confirmDialog.account) return;
    const { id, name } = confirmDialog.account;

    if (confirmDialog.type === "archive") {
      const res = await archiveAccountAction(id);
      if (res.success) {
        toast.success(`Account "${name}" archived`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to archive account");
      }
    } else if (confirmDialog.type === "restore") {
      const res = await restoreAccountAction(id);
      if (res.success) {
        toast.success(`Account "${name}" restored`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to restore account");
      }
    } else if (confirmDialog.type === "delete") {
      const res = await deleteAccountAction(id);
      if (res.success) {
        toast.success(`Account "${name}" deleted permanently`);
        onRefresh?.();
      } else {
        toast.error(res.error || "Failed to delete account");
      }
    }
  };
  const getTypeBadge = (type: AccountItem["type"]) => {
    switch (type) {
      case "ASSET":
      case "BANK":
      case "CASH":
        return <Badge variant="default">{type}</Badge>;
      case "INCOME":
        return <Badge variant="success">{type}</Badge>;
      case "EXPENSES":
      case "OTHER_EXPENSES":
        return <Badge variant="warning">{type}</Badge>;
      case "LIABILITY":
      case "CAPITAL":
        return <Badge variant="secondary">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Account Name</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {accounts.map((acc) => (
              <tr
                key={acc.id}
                className="hover:bg-primary-light/30 transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-navy">
                  {acc.code}
                </td>
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  {acc.name}
                </td>
                <td className="py-3.5 px-4">{getTypeBadge(acc.type)}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={acc.isArchived ? "muted" : "outline"} className="text-[10px]">
                    {acc.isArchived ? "Archived" : "Active"}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info(`Viewing ledger for ${acc.name}`)}>
                        View General Ledger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Account ${acc.code} details copied.`)}>
                        Copy Account Code
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {acc.isArchived ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "restore",
                              account: acc,
                            })
                          }
                          className="text-navy gap-2"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "archive",
                              account: acc,
                            })
                          }
                          className="text-amber-700 gap-2"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive Account
                        </DropdownMenuItem>
                      )}

                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "delete",
                              account: acc,
                            })
                          }
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.account && (
        <DestructiveConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
          actionType={confirmDialog.type}
          recordName={`${confirmDialog.account.code} - ${confirmDialog.account.name}`}
          recordType="Account"
          onConfirm={handleExecuteAction}
        />
      )}
    </div>
  );
}
