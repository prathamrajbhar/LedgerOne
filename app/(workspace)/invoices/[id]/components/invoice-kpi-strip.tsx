"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SerializedInvoiceData } from "../types";
import { DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface InvoiceKpiStripProps {
  invoice: SerializedInvoiceData;
}

export function InvoiceKpiStrip({ invoice }: InvoiceKpiStripProps) {
  const isOverdue =
    invoice.amountDue > 0 && new Date(invoice.dueDate) < new Date();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
          <div className="h-7 w-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold text-navy">
            ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Gross sales value</p>
        </div>
      </Card>

      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Amount Paid</span>
          <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold text-emerald-600">
            ₹{invoice.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {invoice.total > 0
              ? `${Math.round((invoice.amountPaid / invoice.total) * 100)}% collected`
              : "0% collected"}
          </p>
        </div>
      </Card>

      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Balance Due</span>
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center ${
              invoice.amountDue > 0 ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span
            className={`text-xl font-bold ${
              invoice.amountDue > 0 ? "text-amber-600" : "text-muted-foreground"
            }`}
          >
            ₹{invoice.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding receivable</p>
        </div>
      </Card>

      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Due Date</span>
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center ${
              isOverdue ? "bg-rose-50 text-rose-600" : "bg-navy/10 text-navy"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className={`text-base font-bold ${isOverdue ? "text-rose-600" : "text-navy"}`}>
            {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isOverdue ? "Payment is overdue" : "Standard payment window"}
          </p>
        </div>
      </Card>
    </div>
  );
}
