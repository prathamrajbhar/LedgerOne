import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileText, ArrowUpRight } from "lucide-react";
import type { SerializedSalesOrderInvoice } from "../types";

export function SoInvoicesCard({
  invoices,
}: {
  invoices: SerializedSalesOrderInvoice[];
}) {
  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-navy" />
          <h3 className="text-sm font-bold text-foreground">Generated Customer Invoices</h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {invoices.length} linked invoice{invoices.length === 1 ? "" : "s"}
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No customer invoices have been generated for this sales order yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Balance Due (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-primary-light/20">
                  <td className="py-2.5 px-3 font-mono font-bold text-navy">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {inv.invoiceDate
                      ? new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                    ₹{Number(inv.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-warning">
                    ₹{Number(inv.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="inline-flex items-center gap-1 text-xs text-navy font-semibold hover:underline"
                    >
                      View Invoice <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
