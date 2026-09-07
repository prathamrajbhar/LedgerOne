"use client";

import * as React from "react";
import { Receipt } from "lucide-react";

interface BillCreateSummaryProps {
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
}

export function BillCreateSummary({
  subtotal,
  totalDiscount,
  cgst,
  sgst,
  roundOff,
  grandTotal,
}: BillCreateSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-6 p-4 rounded-xl bg-white border border-border/80 shadow-2xs space-y-2 text-xs">
        <div className="flex items-center gap-2 text-navy font-bold">
          <div className="h-6 w-6 rounded-md bg-navy/5 text-navy flex items-center justify-center">
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <span>Procurement & Double-Entry Ledger Impact</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Posting this vendor bill automatically credits{" "}
          <strong className="text-foreground">Accounts Payable (2000)</strong> and debits{" "}
          <strong className="text-foreground">Purchase Expenses / Inventory (5000)</strong>. Input
          tax credits for CGST and SGST will be scheduled in the tax ledger.
        </p>
      </div>

      <div className="md:col-span-6 bg-white p-5 rounded-xl border border-border/80 shadow-2xs space-y-2.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal:</span>
          <span className="font-semibold text-foreground">
            ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount Deducted:</span>
            <span>
              -₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>CGST (Input Tax):</span>
          <span className="font-medium text-foreground">
            ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>SGST (Input Tax):</span>
          <span className="font-medium text-foreground">
            ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Round Off:</span>
          <span>
            {roundOff >= 0 ? "+" : ""}
            ₹{roundOff.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-3 mt-1">
          <span>Total Payable:</span>
          <span className="text-base text-navy font-extrabold">
            ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
