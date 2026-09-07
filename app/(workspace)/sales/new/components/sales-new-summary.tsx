"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

interface SalesNewSummaryProps {
  total: number;
  itemCount: number;
}

export function SalesNewSummary({ total, itemCount }: SalesNewSummaryProps) {
  return (
    <div className="flex justify-end">
      <Card className="w-full md:w-80 p-4 bg-white border border-border rounded-xl shadow-2xs space-y-2.5">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2">
          Order Summary
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Total Product Lines</span>
            <span className="font-semibold text-foreground">{itemCount} items</span>
          </div>

          <div className="flex justify-between py-2 border-t-2 border-border text-sm font-bold text-navy">
            <span>Estimated Total (INR)</span>
            <span className="font-mono">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
