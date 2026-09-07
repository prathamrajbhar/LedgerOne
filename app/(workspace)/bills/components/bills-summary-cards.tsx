"use client";

import * as React from "react";
import { FileText, CheckCircle, AlertCircle, Clock, Mail, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BillSummaryMetrics } from "../bills-types";

interface BillsSummaryCardsProps {
  summaryMetrics: BillSummaryMetrics;
  runningBatchAlerts: boolean;
  onRunBatchAlerts: () => void;
}

export function BillsSummaryCards({
  summaryMetrics,
  runningBatchAlerts,
  onRunBatchAlerts,
}: BillsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Bills */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Bills</span>
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
              ? "Zero vendor bills recorded"
              : "Total recorded procurement bills"}
          </p>
        </div>
      </Card>

      {/* Paid */}
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
              ? "No vendor disbursements recorded yet"
              : "Total vendor disbursements settled"}
          </p>
        </div>
      </Card>

      {/* Outstanding */}
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
              ? "Zero accounts payable due"
              : "Pending accounts payable to vendors"}
          </p>
        </div>
      </Card>

      {/* Overdue */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all flex flex-col justify-between">
        <div>
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
                ? "No overdue vendor payables"
                : "Bills past due payment date"}
            </p>
          </div>
        </div>

        {summaryMetrics.overdueAmount > 0 && (
          <div className="pt-3 mt-3 border-t border-rose-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunBatchAlerts}
              disabled={runningBatchAlerts}
              className="w-full h-7 text-[11px] font-semibold text-rose-700 bg-rose-50/70 border-rose-200 hover:bg-rose-100/80 hover:text-rose-800 gap-1.5 shadow-2xs transition-colors"
              title="Send automated overdue payment reminder alerts to vendors"
            >
              {runningBatchAlerts ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
                  Sending Alerts...
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 text-rose-600" />
                  Send Overdue Reminders
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
