"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { SerializedBillData } from "../types";

interface BillKpiStripProps {
  bill: SerializedBillData;
}

export function BillKpiStrip({ bill }: BillKpiStripProps) {
  const hasDue = bill.amountDue > 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && hasDue;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Amount */}
      <Card className="p-4 bg-white border-border shadow-2xs hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Bill Amount</span>
          <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-navy">
            ₹{bill.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Procurement order value
          </span>
        </div>
      </Card>

      {/* Settled / Paid */}
      <Card className="p-4 bg-white border-border shadow-2xs hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Settled / Paid</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-emerald-600">
            ₹{bill.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {bill.amountPaid >= bill.total ? "Fully settled" : "Partial payments recorded"}
          </span>
        </div>
      </Card>

      {/* Outstanding Balance */}
      <Card className="p-4 bg-white border-border shadow-2xs hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Outstanding Balance</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-xl font-bold font-mono ${hasDue ? "text-amber-600" : "text-muted-foreground"}`}>
            ₹{bill.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {hasDue ? "Accounts payable liability" : "Zero balance due"}
          </span>
        </div>
      </Card>

      {/* Due Date Status */}
      <Card className="p-4 bg-white border-border shadow-2xs hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Due Date Status</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? "bg-rose-50 text-rose-600" : "bg-navy/5 text-navy"}`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-xl font-bold ${isOverdue ? "text-rose-600" : "text-foreground"}`}>
            {new Date(bill.dueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <span className="text-[11px] mt-0.5 block font-medium">
            {isOverdue ? (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Overdue by {Math.abs(diffDays)} days
              </span>
            ) : diffDays === 0 ? (
              <span className="text-amber-600">Due today</span>
            ) : hasDue ? (
              <span className="text-muted-foreground">Due in {diffDays} days</span>
            ) : (
              <span className="text-emerald-600">Settled in full</span>
            )}
          </span>
        </div>
      </Card>
    </div>
  );
}
