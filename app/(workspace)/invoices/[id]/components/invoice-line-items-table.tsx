"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SerializedInvoiceLine } from "../types";
import { Package } from "lucide-react";

interface InvoiceLineItemsTableProps {
  lines: SerializedInvoiceLine[];
}

export function InvoiceLineItemsTable({ lines }: InvoiceLineItemsTableProps) {
  return (
    <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
          <Package className="h-4 w-4 text-navy/70" />
          Purchased Products & Furniture Lines ({lines.length})
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Item / Product</th>
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3 text-right">Quantity</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Tax Rate</th>
              <th className="py-2.5 px-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lines.map((line, index) => (
              <tr key={line.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                <td className="py-2.5 px-3 text-muted-foreground font-mono">{index + 1}</td>
                <td className="py-2.5 px-3 font-medium text-foreground">
                  {line.product?.name || "Standard Item"}
                </td>
                <td className="py-2.5 px-3 font-mono text-muted-foreground">
                  {line.product?.sku || "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-medium">{line.quantity}</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  ₹{line.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-muted-foreground">
                  {line.taxRate ? `${line.taxRate.name} (${line.taxRate.percentage}%)` : "0%"}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold font-mono text-navy">
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
