"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { SerializedInvoiceData } from "../types";

interface InvoiceAccountingEntryProps {
  invoice: SerializedInvoiceData;
}

export function InvoiceAccountingEntry({ invoice }: InvoiceAccountingEntryProps) {
  const isConfirmed = invoice.status === "CONFIRMED";

  return (
    <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
          <BookOpen className="h-4 w-4 text-navy/70" />
          General Ledger Accounting Postings
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          {isConfirmed ? "Double-Entry Posted to Ledger" : "Pending Confirmation (Draft)"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3">Account</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Contact</th>
              <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
              <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr>
              <td className="py-2.5 px-3 font-medium text-foreground">
                10100 - Accounts Receivable (Debtors)
              </td>
              <td className="py-2.5 px-3 text-muted-foreground">Current Asset</td>
              <td className="py-2.5 px-3 text-navy font-medium">{invoice.customer.name}</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">₹0.00</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-medium text-foreground">
                40100 - Furniture Sales Revenue
              </td>
              <td className="py-2.5 px-3 text-muted-foreground">Operating Income</td>
              <td className="py-2.5 px-3 text-muted-foreground">—</td>
              <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">₹0.00</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold text-navy">
                ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-[#F8FAFC]/60 border-t border-border font-semibold">
            <tr>
              <td colSpan={3} className="py-2 px-3 text-right text-muted-foreground">
                Total Balanced Check:
              </td>
              <td className="py-2 px-3 text-right font-mono text-emerald-600">
                ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-3 text-right font-mono text-navy">
                ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
