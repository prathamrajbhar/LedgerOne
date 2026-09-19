import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileText, ArrowUpRight } from "lucide-react";
import type { SerializedPurchaseOrderBill } from "../types";

export function PoBillsCard({
  bills,
}: {
  bills: SerializedPurchaseOrderBill[];
}) {
  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-navy" />
          <h3 className="text-sm font-bold text-foreground">Generated Vendor Bills</h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {bills.length} linked bill{bills.length === 1 ? "" : "s"}
        </span>
      </div>

      {bills.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No vendor bills have been created from this purchase order yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                <th className="py-2.5 px-3">Bill Number</th>
                <th className="py-2.5 px-3">Bill Date</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Balance Due (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-primary-light/20">
                  <td className="py-2.5 px-3 font-mono font-bold text-navy">
                    {bill.billNumber}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {bill.billDate
                      ? new Date(bill.billDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                    ₹{Number(bill.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-warning">
                    ₹{Number(bill.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      href={`/bills/${bill.id}`}
                      className="inline-flex items-center gap-1 text-xs text-navy font-semibold hover:underline"
                    >
                      View Bill <ArrowUpRight className="h-3 w-3" />
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
