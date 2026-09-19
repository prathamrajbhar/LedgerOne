import * as React from "react";
import { Card } from "@/components/ui/card";
import type { SerializedJeLine } from "../types";

export function JeLinesTable({
  lines,
  totalDebit,
  totalCredit,
}: {
  lines: SerializedJeLine[];
  totalDebit: number;
  totalCredit: number;
}) {
  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">General Ledger Posting Lines</h3>
          <p className="text-xs text-muted-foreground">
            Itemized debit and credit account balances.
          </p>
        </div>
        <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-md">
          {lines.length} Line Item{lines.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
              <th className="py-2.5 px-3 whitespace-nowrap">Account</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Partner</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Debit Amount (₹)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Credit Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-primary-light/20">
                <td className="py-2.5 px-3">
                  <span className="font-mono text-navy font-semibold mr-2">{line.account.code}</span>
                  <span className="font-medium text-foreground">{line.account.name}</span>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {line.partner?.name || "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                  {line.debit > 0
                    ? `₹${Number(line.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                  {line.credit > 0
                    ? `₹${Number(line.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "—"}
                </td>
              </tr>
            ))}
            <tr className="bg-[#F9FAFB] font-bold border-t-2 border-navy text-xs">
              <td colSpan={2} className="py-2.5 px-3 text-right text-foreground">
                Total Balanced Ledger:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-navy">
                ₹{Number(totalDebit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-navy">
                ₹{Number(totalCredit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
