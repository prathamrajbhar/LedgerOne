"use client";

import * as React from "react";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { InvoiceSummaryMetrics } from "../invoices-types";

interface InvoicesSummaryCardsProps {
  summaryMetrics: InvoiceSummaryMetrics;
}

export function InvoicesSummaryCards({ summaryMetrics }: InvoicesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Invoices</span>
          <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-navy">
            {summaryMetrics.totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {summaryMetrics.totalCount === 0
              ? "Zero customer invoices issued"
              : "Active customer invoices"}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Paid</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-emerald-600">
            ₹{summaryMetrics.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {summaryMetrics.paidAmount === 0
              ? "No payments collected yet"
              : "Total settled receivables"}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Outstanding</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-amber-600">
            ₹{summaryMetrics.outstandingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {summaryMetrics.outstandingAmount === 0
              ? "Zero outstanding balances"
              : "Pending sales dues"}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Overdue</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-rose-600">
            ₹{summaryMetrics.overdueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {summaryMetrics.overdueAmount === 0
              ? "No overdue invoices"
              : "Receivables past due date"}
          </p>
        </div>
      </Card>
    </div>
  );
}
