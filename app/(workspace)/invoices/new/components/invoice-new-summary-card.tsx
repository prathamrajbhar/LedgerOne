"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

interface InvoiceNewSummaryCardProps {
  calculations: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    cgst: number;
    sgst: number;
    grandTotal: number;
  };
}

export function InvoiceNewSummaryCard({
  calculations,
}: InvoiceNewSummaryCardProps) {
  const { subtotal, totalDiscount, totalTax, cgst, sgst, grandTotal } =
    calculations;

  return (
    <div className="flex justify-end">
      <Card className="w-full md:w-80 p-4 bg-white border border-border rounded-xl shadow-2xs space-y-2.5">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2">
          Invoice Summary
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-foreground">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600">
              <span>Item Discounts</span>
              <span className="font-mono font-medium">
                - ₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {totalTax > 0 && (
            <>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Central GST (CGST)</span>
                <span className="font-mono font-medium text-foreground">
                  ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>State GST (SGST)</span>
                <span className="font-mono font-medium text-foreground">
                  ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between py-2 border-t-2 border-border text-sm font-bold text-navy">
            <span>Grand Total (INR)</span>
            <span className="font-mono">
              ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
