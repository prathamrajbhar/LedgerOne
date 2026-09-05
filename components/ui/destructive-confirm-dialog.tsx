"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Archive,
  RotateCcw,
  Trash2,
  Loader2,
  Info,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export type ConfirmActionType = "archive" | "restore" | "delete";

export interface LinkedDependency {
  id: string;
  lineId?: string;
  type: string;
  typeName: string;
  reference: string;
  date: string;
  status: string;
  amount?: number;
  viewUrl: string;
  canDeleteDirectly?: boolean;
}

export interface UsageDetails {
  canDelete: boolean;
  totalReferences: number;
  breakdown?: Record<string, number>;
  dependencies: LinkedDependency[];
}

interface DestructiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ConfirmActionType;
  recordName: string;
  recordType: string;
  isArchivedTab?: boolean;
  isReferenced?: boolean;
  checkingUsage?: boolean;
  usageDetails?: UsageDetails | null;
  onConfirm: () => Promise<void>;
  onDeleteDependency?: (type: string, id: string, lineId?: string) => Promise<void>;
}

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  actionType,
  recordName,
  recordType,
  isArchivedTab = false,
  isReferenced = false,
  checkingUsage = false,
  usageDetails = null,
  onConfirm,
  onDeleteDependency,
}: DestructiveConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [deletingDepId, setDeletingDepId] = React.useState<string | null>(null);

  // In Active tab, if referenced, offer to archive.
  // In Archived tab, if referenced, show full foreign key dependency breakdown with remove buttons!
  const isBlockedInArchive = isArchivedTab && actionType === "delete" && isReferenced;
  const isAutoArchivingInActive = !isArchivedTab && actionType === "delete" && isReferenced;

  const getDialogConfig = () => {
    if (isBlockedInArchive) {
      return {
        title: `Cannot Delete ${recordType}: Linked Foreign Key Records Found`,
        description: `"${recordName}" is actively referenced by documents in the database. To permanently remove this record, remove or reassign the blocking documents below:`,
        confirmText: "Delete Permanently",
        confirmVariant: "destructive" as const,
        confirmClassName: "bg-rose-600 hover:bg-rose-700 text-white",
        icon: ShieldAlert,
        iconColor: "text-rose-600 bg-rose-50 border-rose-200",
      };
    }

    if (isAutoArchivingInActive) {
      return {
        title: `Archive ${recordType} Instead of Deleting`,
        description: `"${recordName}" is referenced in historical transactions (orders, invoices, or journal lines). Under accounting regulations, records with transaction history cannot be permanently destroyed.`,
        confirmText: "Archive Record",
        confirmVariant: "default" as const,
        confirmClassName: "bg-navy hover:bg-navy-hover text-white",
        icon: Archive,
        iconColor: "text-navy bg-navy/10 border-navy/20",
      };
    }

    switch (actionType) {
      case "archive":
        return {
          title: `Archive ${recordType}?`,
          description: `"${recordName}" will be archived and hidden from active tables and dropdowns. Historical transactions remain preserved. You can restore it anytime.`,
          confirmText: "Archive",
          confirmVariant: "default" as const,
          confirmClassName: "bg-amber-600 hover:bg-amber-700 text-white",
          icon: Archive,
          iconColor: "text-amber-600 bg-amber-50 border-amber-200",
        };
      case "restore":
        return {
          title: `Restore ${recordType}?`,
          description: `"${recordName}" will be restored back to active status and made available across orders and selections.`,
          confirmText: "Restore",
          confirmVariant: "default" as const,
          confirmClassName: "bg-navy hover:bg-navy-hover text-white",
          icon: RotateCcw,
          iconColor: "text-navy bg-navy/10 border-navy/20",
        };
      case "delete":
        return {
          title: `Permanently Delete ${recordType}?`,
          description: `Are you sure you want to permanently delete "${recordName}"? This record has zero transaction history and will be removed permanently. This action cannot be undone.`,
          confirmText: "Delete Permanently",
          confirmVariant: "destructive" as const,
          confirmClassName: "bg-rose-600 hover:bg-rose-700 text-white",
          icon: Trash2,
          iconColor: "text-rose-600 bg-rose-50 border-rose-200",
        };
    }
  };

  const config = getDialogConfig();
  const Icon = config.icon;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDependencyItem = async (dep: LinkedDependency) => {
    if (!onDeleteDependency) return;
    const targetKey = dep.lineId || dep.id;
    setDeletingDepId(targetKey);
    try {
      await onDeleteDependency(dep.type, dep.id, dep.lineId);
    } finally {
      setDeletingDepId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isBlockedInArchive ? "max-w-2xl bg-white p-6" : "max-w-md bg-white p-6"}>
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className={`p-2.5 rounded-xl border ${config.iconColor} shrink-0`}>
            {checkingUsage ? (
              <Loader2 className="h-5 w-5 animate-spin text-navy" />
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-foreground">
              {config.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {config.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Loading Usage Details */}
        {checkingUsage && (
          <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 border border-border rounded-xl my-2">
            <Loader2 className="h-4 w-4 animate-spin text-navy" />
            <span className="text-xs text-muted-foreground">Checking foreign key constraints and linked documents...</span>
          </div>
        )}

        {/* Foreign Key Dependency Breakdown Table */}
        {!checkingUsage && isBlockedInArchive && (
          <div className="space-y-3 my-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-foreground">
                Blocking Dependencies ({usageDetails?.dependencies.length || 0})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Delete or unlink each row to enable permanent deletion
              </span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-border text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Document</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(!usageDetails?.dependencies || usageDetails.dependencies.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-success inline mr-1.5" />
                        All foreign key dependencies resolved! You can now permanently delete this record.
                      </td>
                    </tr>
                  ) : (
                    usageDetails.dependencies.map((dep) => {
                      const itemKey = dep.lineId || dep.id;
                      const isDeletingThis = deletingDepId === itemKey;

                      return (
                        <tr key={itemKey} className="hover:bg-primary-light/20 transition-colors">
                          <td className="py-2 px-3 font-medium text-foreground">
                            {dep.typeName}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-navy">
                            {dep.reference}
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                              {dep.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {dep.amount !== undefined ? `₹${dep.amount.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={dep.viewUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 p-1 text-[11px] text-muted-foreground hover:text-navy hover:underline"
                                title="Open in new tab"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </Link>
                              {onDeleteDependency && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeletingThis || !dep.canDeleteDirectly}
                                  onClick={() => handleDeleteDependencyItem(dep)}
                                  className="h-6 px-2 text-[11px] text-destructive hover:bg-rose-50 hover:text-destructive"
                                  title={dep.canDeleteDirectly ? "Delete this blocking document/line" : "Cannot delete locked/confirmed document directly. Please cancel it first."}
                                >
                                  {isDeletingThis ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Trash2 className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {usageDetails?.dependencies && usageDetails.dependencies.length > 0 && (
              <p className="text-[11px] text-muted-foreground italic px-1">
                Tip: Confirmed orders or invoices must be cancelled/voided in their respective screens before their foreign key can be deleted.
              </p>
            )}
          </div>
        )}

        {/* Auto-archiving Explanation Banner (Active Tab) */}
        {isAutoArchivingInActive && (
          <div className="flex items-start gap-2.5 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-navy text-xs mt-2">
            <Info className="h-4 w-4 shrink-0 text-navy mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">What happens when archived?</span>
              <span className="text-[11px] text-muted-foreground leading-normal block">
                It immediately disappears from your active catalog and cannot be selected on new invoices, but your past accounting ledgers remain 100% balanced.
              </span>
            </div>
          </div>
        )}

        {/* Safe Permanent Delete Banner (Archived or Active with 0 dependencies) */}
        {actionType === "delete" && !isReferenced && !checkingUsage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs mt-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Zero linked transactions found. Safe to permanently delete from PostgreSQL.</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading || checkingUsage}
          >
            {isBlockedInArchive ? "Close" : "Cancel"}
          </Button>

          {/* Action button is enabled if not blocked in archive */}
          {(!isBlockedInArchive || (usageDetails && usageDetails.dependencies.length === 0)) && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={loading || checkingUsage}
              className={`gap-1.5 ${config.confirmClassName}`}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isAutoArchivingInActive ? (
                <Archive className="h-3.5 w-3.5" />
              ) : null}
              {config.confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
