import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { SerializedPurchaseOrderLine } from "../types";

export function PoLinesTable({
  lines,
  total,
}: {
  lines: SerializedPurchaseOrderLine[];
  total: number;
}) {
  return (
    <Card className="p-5 bg-white shadow-card space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Procured Raw Materials & Supplies</h3>
          <p className="text-xs text-muted-foreground">
            Timber, upholstery fabrics, foam, and hardware items ordered from vendor.
          </p>
        </div>
        <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-md">
          {lines.length} Line Item{lines.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[550px]">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
              <th className="py-2.5 px-3 whitespace-nowrap">Raw Material / SKU</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Cost Center (Analytic)</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Quantity</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Unit Cost (₹)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Line Total (₹)</th>
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
                <td className="py-2.5 px-3 text-muted-foreground">
                  {line.analyticAccount?.name || "General Production"}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-foreground">
                  {Number(line.quantity)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  ₹{Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                  ₹{Number(line.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-3 border-t border-border">
        <div className="w-64 flex justify-between text-sm font-bold text-navy pt-1.5">
          <span>PO Total:</span>
          <span className="font-mono">
            ₹{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  );
}
