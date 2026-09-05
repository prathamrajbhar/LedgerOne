"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SerializedBillLine } from "../types";

interface BillLineItemsTableProps {
  lines: SerializedBillLine[];
}

export function BillLineItemsTable({ lines }: BillLineItemsTableProps) {
  return (
    <Card className="border-border shadow-2xs bg-white overflow-hidden">
      <div className="p-4 border-b border-border bg-[#F8FAFC]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
            Purchased Products / Materials
          </h3>
          <span className="text-[11px] text-muted-foreground">
            ({lines.length} line item{lines.length === 1 ? "" : "s"})
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
              <th className="py-3 px-4">Item / Description</th>
              <th className="py-3 px-4">Cost Center / Analytic</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Unit Cost</th>
              <th className="py-3 px-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-surface-subtle/30">
                <td className="py-3 px-4 font-medium text-foreground">
                  {line.product?.name || "Product"}
                  {line.product?.sku && (
                    <span className="text-[10px] text-muted-foreground ml-2 font-normal">
                      ({line.product.sku})
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {line.analyticAccount?.name || "General Procurement"}
                </td>
                <td className="py-3 px-4 text-right font-mono">{line.quantity}</td>
                <td className="py-3 px-4 text-right font-mono">
                  ₹{line.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-navy">
                  ₹{line.lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
