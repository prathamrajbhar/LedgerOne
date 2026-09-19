import * as React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import type { SerializedJournalEntryDetail } from "../types";

export function JeKpiStrip({ entry }: { entry: SerializedJournalEntryDetail }) {
  const isBalanced = Math.abs(Number(entry.totalDebit) - Number(entry.totalCredit)) < 0.01;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Total Debit</span>
          <span className="text-lg font-bold text-foreground">
            ₹{Number(entry.totalDebit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Total Credit</span>
          <span className="text-lg font-bold text-foreground">
            ₹{Number(entry.totalCredit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
          isBalanced ? "bg-[#EAF7F1] text-success" : "bg-[#FDEEEE] text-destructive"
        }`}>
          {isBalanced ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Balance Status</span>
          <span className={`text-lg font-bold ${isBalanced ? "text-success" : "text-destructive"}`}>
            {isBalanced ? "Balanced" : "Unbalanced"}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Ledger Lines</span>
          <span className="text-lg font-bold text-foreground">{entry.lines.length} lines</span>
        </div>
      </Card>
    </div>
  );
}
