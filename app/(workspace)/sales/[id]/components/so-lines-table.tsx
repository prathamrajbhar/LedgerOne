import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { SerializedSalesOrderLine } from "../types";

export function SoLinesTable({
  lines,
  total,
}: {
  lines: SerializedSalesOrderLine[];
  total: number;
}) {
  const totalTax = lines.reduce((acc, l) => acc + (Number(l.taxAmount) || 0), 0);
  const subtotal = Number(total) - totalTax;

  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Ordered Furniture Items</h3>
          <p className="text-xs text-muted-foreground">
            Product models, quantities, unit prices, and applied tax specifications.
          </p>
        </div>
        <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-md">
          {lines.length} Line Item{lines.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
              <th className="py-2.5 px-3 whitespace-nowrap">Item / SKU</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Description</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Qty</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Unit Price (₹)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Tax (₹)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Subtotal (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-primary-light/20">
                <td className="py-2.5 px-3">
                  <Link
                    href={`/products/${line.product.id}`}
                    className="font-semibold text-foreground hover:text-navy hover:underline block"
                  >
                    {line.product.name}
                  </Link>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    SKU: {line.product.sku}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground max-w-[200px] truncate">
                  {line.description || "Standard model specifications"}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-foreground">
                  {line.quantity}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  ₹{Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹{Number(line.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  {line.taxRate && (
                    <span className="text-[10px] block text-muted-foreground/70">
                      ({line.taxRate.name} {line.taxRate.percentage}%)
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                  ₹{Number(line.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-3 border-t border-border">
        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Net Untaxed Amount:</span>
            <span className="font-mono font-medium text-foreground">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Taxes:</span>
            <span className="font-mono font-medium text-foreground">
              ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-navy pt-1.5 border-t border-border">
            <span>Order Total:</span>
            <span className="font-mono">
              ₹{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
