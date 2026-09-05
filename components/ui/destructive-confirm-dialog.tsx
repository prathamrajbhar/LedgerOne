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
import { AlertTriangle, Archive, RotateCcw, Trash2, Loader2 } from "lucide-react";

export type ConfirmActionType = "archive" | "restore" | "delete";

interface DestructiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ConfirmActionType;
  recordName: string;
  recordType: string;
  onConfirm: () => Promise<void>;
}

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  actionType,
  recordName,
  recordType,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const config = {
    archive: {
      title: `Archive ${recordType}?`,
      description: `"${recordName}" will be archived and hidden from active selections. Historical transactions will remain preserved. You can restore it anytime.`,
      confirmText: "Archive",
      confirmVariant: "destructive" as const,
      icon: Archive,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
    },
    restore: {
      title: `Restore ${recordType}?`,
      description: `"${recordName}" will be restored back to active status and made available across the system.`,
      confirmText: "Restore",
      confirmVariant: "default" as const,
      icon: RotateCcw,
      iconColor: "text-navy bg-navy/10 border-navy/20",
    },
    delete: {
      title: `Permanently Delete ${recordType}?`,
      description: `Are you sure you want to permanently delete "${recordName}"? This action cannot be undone. Only records with zero linked transactions can be deleted.`,
      confirmText: "Delete Permanently",
      confirmVariant: "destructive" as const,
      icon: Trash2,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200",
    },
  }[actionType];

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
            <Icon className="h-5 w-5" />
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

        {actionType === "delete" && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs mt-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>If transactions exist for this record, delete will be prevented.</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="gap-1.5"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
