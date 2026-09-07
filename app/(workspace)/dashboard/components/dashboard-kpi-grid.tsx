"use client";

import * as React from "react";
import {
  TrendingUp,
  Receipt,
  CircleDollarSign,
  Users,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardKPIs } from "@/app/actions/dashboard.actions";

interface DashboardKpiGridProps {
  kpis: DashboardKPIs;
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Total Revenue */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Total Revenue
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div
            className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${
              kpis.revenueChange >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {kpis.revenueChange >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(kpis.revenueChange).toFixed(1)}%</span>
            <span className="text-muted-foreground font-normal">vs prev period</span>
          </div>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive">
            <Receipt className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Total Expenses
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.totalExpenses.toLocaleString("en-IN")}
          </div>
          <div
            className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${
              kpis.expensesChange >= 0 ? "text-destructive" : "text-success"
            }`}
          >
            {kpis.expensesChange >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(kpis.expensesChange).toFixed(1)}%</span>
            <span className="text-muted-foreground font-normal">vs prev period</span>
          </div>
        </div>
      </Card>

      {/* Net Profit */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
            <CircleDollarSign className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Net Profit
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.netProfit.toLocaleString("en-IN")}
          </div>
          <div
            className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${
              kpis.profitChange >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {kpis.profitChange >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(kpis.profitChange).toFixed(1)}%</span>
            <span className="text-muted-foreground font-normal">vs prev period</span>
          </div>
        </div>
      </Card>

      {/* Accounts Receivable */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
            <Users className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            Accounts Receivable
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.accountsReceivable.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
            <span className="font-normal">Outstanding invoices</span>
          </div>
        </div>
      </Card>

      {/* Accounts Payable */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#6366F1]">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            Accounts Payable
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.accountsPayable.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
            <span className="font-normal">Outstanding bills</span>
          </div>
        </div>
      </Card>

      {/* Cash Balance */}
      <Card className="p-4 hover:border-border-strong transition-all bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Cash Balance
          </span>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            ₹{kpis.cashBalance.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
            <span className="font-normal">Bank + Cash accounts</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
