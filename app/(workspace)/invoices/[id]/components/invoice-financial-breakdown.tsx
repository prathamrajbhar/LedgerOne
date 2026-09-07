"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SerializedInvoicePayment } from "../types";
import { CreditCard, DollarSign } from "lucide-react";

interface InvoiceFinancialBreakdownProps {
  total: number;
  amountPaid: number;
  amountDue: number;
  hasDue: boolean;
  isConfirmed: boolean;
  payments: SerializedInvoicePayment[];
  onOpenPaymentModal: () => void;
}

export function InvoiceFinancialBreakdown({
  total,
  amountPaid,
  amountDue,
  hasDue,
  isConfirmed,
  payments,
  onOpenPaymentModal,
}: InvoiceFinancialBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Payment History Card */}
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-navy/70" />
            Receipts & Payment History ({payments.length})
          </div>
          {isConfirmed && hasDue && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenPaymentModal}
              className="h-7 text-xs text-teal hover:text-teal hover:bg-teal/10 border-teal/30 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              Add Payment
            </Button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No payments recorded yet for this invoice.
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8FAFC] border border-border/60"
              >
                <div>
                  <span className="font-semibold text-navy">
                    ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-muted-foreground ml-2">via {p.paymentMethod}</span>
                  {p.note && (
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">{p.note}</p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {p.paymentDate
                    ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Balance Summary Card */}
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-3">
          Financial Summary
        </div>

        <div className="space-y-2 text-xs divide-y divide-border/60">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Total Invoiced Amount</span>
            <span className="font-semibold text-navy font-mono">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between py-1.5 text-emerald-600">
            <span className="font-medium">Total Paid to Date</span>
            <span className="font-semibold font-mono">
              - ₹{amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between py-2 border-t-2 border-border text-sm font-bold">
            <span className="text-foreground">Remaining Balance Due</span>
            <span className={`font-mono ${amountDue > 0 ? "text-amber-600" : "text-navy"}`}>
              ₹{amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
