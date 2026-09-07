"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentNewHeaderProps {
  submitting: boolean;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function PaymentNewHeader({
  submitting,
  onSave,
  onCancel,
}: PaymentNewHeaderProps) {
  return (
    <div className="space-y-3">
      <Link
        href="/payments"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Payments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Record Payment or Receipt
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal/10 text-teal border border-teal/20">
              Cash & Bank Ledger
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Reconcile customer invoice receipts and vendor procurement bill payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
            className="h-9 text-xs px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={submitting}
            className="h-9 text-xs px-4 bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
