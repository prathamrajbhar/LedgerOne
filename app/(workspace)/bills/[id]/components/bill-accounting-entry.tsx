"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function BillAccountingEntry() {
  return (
    <Card className="p-5 border border-navy/15 bg-[#16324F]/5 shadow-2xs space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-navy" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
          Accounting Entry (Double Entry Posting)
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Posting this vendor bill automatically credits Vendor Payables (Accounts Payable) and debits Material Procurement / Input Tax:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal">Purchase Expense</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              DEBIT
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Recognized in Profit & Loss as material consumption
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Input Tax (GST)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              DEBIT
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Input tax credit claimable on purchases
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy">Vendor Payable</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
              CREDIT
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Current liability owed to vendor on balance sheet
          </p>
        </div>
      </div>
    </Card>
  );
}
