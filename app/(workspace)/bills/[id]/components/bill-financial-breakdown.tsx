"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SerializedBillPayment } from "../types";

interface BillFinancialBreakdownProps {
  total: number;
  amountPaid: number;
  amountDue: number;
  hasDue: boolean;
  isConfirmed: boolean;
  payments: SerializedBillPayment[];
  onOpenPaymentModal: () => void;
}

export function BillFinancialBreakdown({
  total,
  amountPaid,
  amountDue,
  hasDue,
  isConfirmed,
  payments,
  onOpenPaymentModal,
}: BillFinancialBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Payment History Card */}
      <Card className="p-5 border-border shadow-2xs bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
            Disbursement Payment History
          </h3>
          {isConfirmed && hasDue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenPaymentModal}
              className="h-6 text-[11px] text-teal hover:text-teal/90 px-2"
            >
              + Add Payment
            </Button>
          )}
        </div>

        {payments && payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8FAFC] border border-border/60"
              >
                <div>
                  <div className="font-bold text-foreground font-mono">
                    ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    via {p.paymentMethod} {p.note && `• ${p.note}`}
                  </div>
                </div>
                <span className="text-muted-foreground text-[11px] font-mono">
                  {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-border text-center text-xs text-muted-foreground">
            No disbursement payments recorded for this bill yet.
          </div>
        )}
      </Card>

      {/* Financial Breakdown Card */}
      <Card className="p-5 border-border shadow-2xs bg-white space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy border-b border-border pb-2">
          Financial Balance Breakdown
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Gross Bill Amount:</span>
            <span className="font-bold text-foreground font-mono">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Total Paid to Date:</span>
            <span className="font-medium font-mono">
              - ₹{amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-3 mt-1">
            <span>Outstanding Payable:</span>
            <span className={`font-mono ${hasDue ? "text-amber-600" : "text-muted-foreground"}`}>
              ₹{amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
