"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export interface SerializedJournalEntryLine {
  id: string;
  accountId: string;
  partnerId: string | null;
  debit: number;
  credit: number;
  account: {
    code: string;
    name: string;
  };
  partner: {
    name: string;
  } | null;
}

export interface SerializedJournalEntry {
  id: string;
  entryNumber: string;
  accountingDate: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
  journal: {
    name: string;
  };
  lines: SerializedJournalEntryLine[];
}

interface TransactionRowProps {
  entry: SerializedJournalEntry;
  docRef: { ref: string; party: string; type: string };
  isBalanced: boolean;
}

export function TransactionRow({
  entry,
  docRef,
  isBalanced,
}: TransactionRowProps) {
  const [expanded, setExpanded] = React.useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <tr className="hover:bg-primary-light/30 transition-colors">
        <td className="py-3.5 px-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
          {formatDate(entry.accountingDate)}
        </td>
        <td className="py-3.5 px-4 font-mono font-bold text-navy">
          {entry.entryNumber}
        </td>
        <td className="py-3.5 px-4 text-muted-foreground">
          {entry.journal.name}
        </td>
        <td className="py-3.5 px-4 font-medium text-foreground">
          {docRef.ref}
          <span className="ml-1.5 text-[10px] text-muted-foreground">
            ({docRef.type})
          </span>
        </td>
        <td className="py-3.5 px-4 text-foreground">
          {docRef.party}
        </td>
        <td className="py-3.5 px-4 text-right font-bold text-foreground">
          ₹{formatAmount(entry.totalDebit)}
        </td>
        <td className="py-3.5 px-4 text-right font-bold text-foreground">
          ₹{formatAmount(entry.totalCredit)}
        </td>
        <td className="py-3.5 px-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <StatusBadge status={entry.status} />
            {!isBalanced && (
              <span className="text-[10px] text-destructive font-semibold" title="Unbalanced entry">
                ⚠
              </span>
            )}
          </div>
        </td>
      </tr>
      {expanded && entry.lines && entry.lines.length > 0 && (
        <tr>
          <td colSpan={9} className="bg-[#F9FAFB] p-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground mb-3">Entry Lines:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-white border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                      <th className="py-2 px-3 text-left">Account</th>
                      <th className="py-2 px-3 text-left">Partner</th>
                      <th className="py-2 px-3 text-right">Debit (₹)</th>
                      <th className="py-2 px-3 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-primary-light/20">
                        <td className="py-2 px-3 text-foreground">
                          <span className="font-mono text-[10px] text-muted-foreground mr-2">
                            {line.account.code}
                          </span>
                          {line.account.name}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {line.partner?.name || "-"}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-foreground">
                          {line.debit > 0 ? `₹${formatAmount(line.debit)}` : "-"}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-foreground">
                          {line.credit > 0 ? `₹${formatAmount(line.credit)}` : "-"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#F9FAFB] font-bold border-t-2 border-navy">
                      <td colSpan={2} className="py-2 px-3 text-right text-foreground">
                        Total:
                      </td>
                      <td className="py-2 px-3 text-right text-foreground">
                        ₹{formatAmount(entry.totalDebit)}
                      </td>
                      <td className="py-2 px-3 text-right text-foreground">
                        ₹{formatAmount(entry.totalCredit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
