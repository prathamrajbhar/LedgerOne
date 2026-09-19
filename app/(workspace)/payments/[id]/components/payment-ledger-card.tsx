import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookOpen, ArrowUpRight } from "lucide-react";
import type { SerializedPaymentJournalEntry } from "../types";

export function PaymentLedgerCard({
  journalEntry,
}: {
  journalEntry?: SerializedPaymentJournalEntry | null;
}) {
  if (!journalEntry) {
    return (
      <Card className="p-5 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
          <BookOpen className="h-4 w-4 text-navy" />
          <h3 className="text-sm font-bold text-foreground">Double-Entry Accounting Journal</h3>
        </div>
        <p className="text-xs text-muted-foreground py-4 text-center">
          No automated journal entry is linked to this payment.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-navy" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Posted Double-Entry Journal ({journalEntry.entryNumber})
            </h3>
            <p className="text-xs text-muted-foreground">
              General ledger transaction records ensuring dual-entry balancing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={journalEntry.status} />
          <Link
            href={`/journal-entries/${journalEntry.id}`}
            className="text-xs text-navy font-semibold hover:underline flex items-center gap-1"
          >
            Full Entry <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
              <th className="py-2.5 px-3">Account Code & Name</th>
              <th className="py-2.5 px-3">Partner</th>
              <th className="py-2.5 px-3 text-right">Debit (₹)</th>
              <th className="py-2.5 px-3 text-right">Credit (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {journalEntry.lines.map((line) => (
              <tr key={line.id} className="hover:bg-primary-light/20">
                <td className="py-2.5 px-3">
                  <span className="font-mono text-navy font-semibold mr-2">{line.account.code}</span>
                  <span className="font-medium text-foreground">{line.account.name}</span>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {line.partnerName || "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                  {line.debit > 0
                    ? `₹${line.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                  {line.credit > 0
                    ? `₹${line.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
              </tr>
            ))}
            <tr className="bg-[#F9FAFB] font-bold border-t-2 border-navy text-xs">
              <td colSpan={2} className="py-2.5 px-3 text-right text-foreground">
                Total Balanced Ledger:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-navy">
                ₹{journalEntry.totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-navy">
                ₹{journalEntry.totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
