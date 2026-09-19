import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export interface BillingStats {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueCount: number;
  totalInvoices: number;
}

export function PortalBillingKpiCards({ stats }: { stats: BillingStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Billed */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
          <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-navy">
            ₹{stats.totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Across {stats.totalInvoices} issued invoice{stats.totalInvoices === 1 ? "" : "s"}
          </p>
        </div>
      </Card>

      {/* Total Paid */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Paid</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-emerald-600">
            ₹{stats.totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Settled via online payments & transfers
          </p>
        </div>
      </Card>

      {/* Outstanding Dues */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Current Outstanding</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-amber-600">
            ₹{stats.totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pending payment balance
          </p>
        </div>
      </Card>

      {/* Overdue Count */}
      <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Overdue Invoices</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-rose-600">
            {stats.overdueCount}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Past payment due date
          </p>
        </div>
      </Card>
    </div>
  );
}
