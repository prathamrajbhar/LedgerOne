"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, AlertCircle, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface KPICardData {
  financialSummary?: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    accountsReceivable: number;
    accountsPayable: number;
    cashBalance: number;
  };
  payablesPulse?: {
    pendingBillsCount: number;
    pendingBillsTotal: number;
    overdueBillsCount: number;
    urgentBills?: Array<{ billNumber: string; vendorName: string; amountDue: number; dueDate: string }>;
  };
  receivablesPulse?: {
    overdueInvoicesCount: number;
    urgentInvoices?: Array<{ invoiceNumber: string; customerName: string; amountDue: number; dueDate: string }>;
  };
  inventoryPulse?: {
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export function KPICard({ data }: { data: KPICardData }) {
  const router = useRouter();
  const summary = data?.financialSummary;
  const payables = data?.payablesPulse;
  const receivables = data?.receivablesPulse;
  const inventory = data?.inventoryPulse;

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <span className="font-bold text-navy dark:text-slate-100 flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-teal" />
          Financial & Operational Pulse
        </span>
        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
          Live Data
        </Badge>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Revenue</span>
            <span className="font-semibold text-emerald-600">
              ₹{summary.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Net Profit</span>
            <span className={`font-semibold ${summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ₹{summary.netProfit.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Receivables</span>
            <span className="font-semibold text-amber-600">
              ₹{summary.accountsReceivable.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Payables</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              ₹{summary.accountsPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* Payables breakdown */}
      {payables && payables.pendingBillsCount > 0 && (
        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium truncate mr-2">
            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{payables.pendingBillsCount} Pending Bills (₹{payables.pendingBillsTotal.toLocaleString("en-IN")})</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => router.push("/bills")}
            className="h-5 px-2 text-[10px] text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 shrink-0 cursor-pointer"
          >
            View
          </Button>
        </div>
      )}

      {/* Receivables overdue */}
      {receivables && receivables.overdueInvoicesCount > 0 && (
        <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded text-[11px] text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium truncate mr-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{receivables.overdueInvoicesCount} Overdue Invoices</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => router.push("/invoices")}
            className="h-5 px-2 text-[10px] text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 shrink-0 cursor-pointer"
          >
            View
          </Button>
        </div>
      )}

      {/* Low stock notice */}
      {inventory && (inventory.lowStockCount > 0 || inventory.outOfStockCount > 0) && (
        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate mr-2">
            <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{inventory.lowStockCount} low stock / {inventory.outOfStockCount} out of stock</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => router.push("/products")}
            className="h-5 px-2 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 cursor-pointer"
          >
            Inventory
          </Button>
        </div>
      )}
    </div>
  );
}
