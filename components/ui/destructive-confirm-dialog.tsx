"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Archive, RotateCcw, Trash2, Loader2, Info } from "lucide-react";

export type ConfirmActionType = "archive" | "restore" | "delete";

interface DestructiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ConfirmActionType;
  recordName: string;
  recordType: string;
  isReferenced?: boolean; // If record has transactions, intelligently archive instead of hard delete
  checkingUsage?: boolean;
  onConfirm: () => Promise<void>;
}

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  actionType,
  recordName,
  recordType,
  isReferenced = false,
  checkingUsage = false,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  // When user triggers "delete" but record is referenced in transactions,
  // we intelligently switch to Archive with a clear explanation to protect audit trails.
  const isAutoArchiving = actionType === "delete" && isReferenced;

  const getDialogConfig = () => {
    if (isAutoArchiving) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6">
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

        {isAutoArchiving && (
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

        {actionType === "delete" && !isReferenced && !checkingUsage && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs mt-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Zero transactions detected. Permanent deletion is safe to proceed.</span>
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
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading || checkingUsage}
            className={`gap-1.5 ${config.confirmClassName}`}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isAutoArchiving ? (
              <Archive className="h-3.5 w-3.5" />
            ) : null}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
