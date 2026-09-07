"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceNewHeaderProps {
  creating: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function InvoiceNewHeader({
  creating,
  onSave,
  onCancel,
}: InvoiceNewHeaderProps) {
  return (
    <div className="space-y-3">
      <Link
        href="/invoices"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Invoices
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              New Customer Invoice
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-navy/5 text-navy border border-navy/15">
              Draft
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create an official tax sales invoice for delivered furniture or services.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={creating}
            className="h-9 text-xs px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={creating}
            className="h-9 text-xs px-4 bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
