"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface JournalEntryFormBalanceProps {
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export function JournalEntryFormBalance({
  totalDebit,
  totalCredit,
  isBalanced,
}: JournalEntryFormBalanceProps) {
  const difference = Math.abs(totalDebit - totalCredit);

  return (
    <div className="flex justify-end">
      <Card className="w-full md:w-88 p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2 flex items-center justify-between">
          <span>Double-Entry Balance Check</span>
          {isBalanced ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" /> Unbalanced
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs divide-y divide-border/50">
          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Total Debit (Dr)</span>
            <span className="font-mono font-semibold text-foreground">
              ₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Total Credit (Cr)</span>
            <span className="font-mono font-semibold text-foreground">
              ₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between py-1.5 text-xs font-bold border-t-2 border-border">
            <span>Difference</span>
            <span className={`font-mono ${isBalanced ? "text-emerald-600" : "text-rose-600"}`}>
              ₹{difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {!isBalanced && (
          <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg leading-tight">
            Debit and Credit totals must match exactly before posting to general ledger accounts.
          </p>
        )}
      </Card>
    </div>
  );
}
