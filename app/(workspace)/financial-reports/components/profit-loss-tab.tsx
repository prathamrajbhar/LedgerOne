"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";

interface ProfitLossTabProps {
  report: ProfitLossReport | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function ProfitLossTab({
  report,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  loading,
}: ProfitLossTabProps) {
  if (!report) return null;

  return (
    <Card className="p-6 bg-white shadow-card">
      <div className="border-b border-border pb-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Statement of Profit & Loss (P&L)
            </h2>
            <p className="text-xs text-muted-foreground">
              Period: {new Date(startDate).toLocaleDateString("en-IN")} to{" "}
              {new Date(endDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-light text-navy">
            INR (₹)
          </span>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-end gap-3 pt-3 border-t border-border">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-white text-foreground"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-white text-foreground"
            />
          </div>
          <Button
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs bg-navy text-white hover:bg-navy-hover"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Revenue */}
        <div>
          <div className="flex justify-between font-bold text-sm text-navy pb-1 border-b border-border">
            <span>I. REVENUE FROM OPERATIONS</span>
            <span>
              ₹
              {Number(report.totalIncome).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {report.incomeAccounts.length > 0 ? (
            <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
              {report.incomeAccounts.map((acc) => (
                <div key={acc.accountId} className="flex justify-between">
                  <span>{acc.name}</span>
                  <span>
                    ₹
                    {Number(acc.balance).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 pl-3 text-muted-foreground italic">
              No revenue recorded for this period.
            </p>
          )}
        </div>

        {/* Expenses */}
        <div>
          <div className="flex justify-between font-bold text-sm text-foreground pb-1 border-b border-border">
            <span>II. EXPENSES</span>
            <span>
              ₹
              {Number(report.totalExpenses).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {report.expenseAccounts.length > 0 ? (
            <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
              {report.expenseAccounts.map((acc) => (
                <div key={acc.accountId} className="flex justify-between">
                  <span>{acc.name}</span>
                  <span>
                    ₹
                    {Number(acc.balance).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 pl-3 text-muted-foreground italic">
              No expenses recorded for this period.
            </p>
          )}
        </div>

        {/* Net Profit Summary */}
        <div className="pt-3 border-t-2 border-border">
          <div
            className={`flex justify-between font-bold text-sm p-3 rounded-lg ${
              Number(report.netProfit) >= 0
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <span>NET PROFIT / (LOSS) (I - II)</span>
            <span>
              ₹
              {Number(report.netProfit).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
