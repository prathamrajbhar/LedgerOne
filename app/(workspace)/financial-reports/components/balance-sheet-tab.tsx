"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";

interface BalanceSheetTabProps {
  report: BalanceSheetReport | null;
  asOfDate: string;
  onAsOfDateChange: (date: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function BalanceSheetTab({
  report,
  asOfDate,
  onAsOfDateChange,
  onRefresh,
  loading,
}: BalanceSheetTabProps) {
  if (!report) return null;

  return (
    <Card className="p-6 bg-white shadow-card">
      <div className="border-b border-border pb-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Balance Sheet</h2>
            <p className="text-xs text-muted-foreground">
              As of: {new Date(asOfDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report.balanceCheck.isBalanced ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Balanced (A = L + E)
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Unbalanced
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-light text-navy">
              INR (₹)
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-end gap-3 pt-3 border-t border-border">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              As of Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => onAsOfDateChange(e.target.value)}
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
        {/* Assets */}
        <div>
          <div className="flex justify-between font-bold text-sm text-navy pb-1 border-b border-border">
            <span>I. ASSETS</span>
            <span>
              ₹
              {report.assets.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
            {report.assets.accounts.map((acc) => (
              <div key={acc.accountId} className="flex justify-between">
                <span>{acc.accountName}</span>
                <span>
                  ₹
                  {acc.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div>
          <div className="flex justify-between font-bold text-sm text-foreground pb-1 border-b border-border">
            <span>II. LIABILITIES</span>
            <span>
              ₹
              {report.liabilities.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
            {report.liabilities.accounts.map((acc) => (
              <div key={acc.accountId} className="flex justify-between">
                <span>{acc.accountName}</span>
                <span>
                  ₹
                  {acc.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Equity */}
        <div>
          <div className="flex justify-between font-bold text-sm text-foreground pb-1 border-b border-border">
            <span>III. CAPITAL & RESERVES (EQUITY)</span>
            <span>
              ₹
              {report.equity.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
            {report.equity.accounts.map((acc) => (
              <div key={acc.accountId} className="flex justify-between">
                <span>{acc.accountName}</span>
                <span>
                  ₹
                  {acc.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Liabilities and Equity */}
        <div className="pt-3 border-t-2 border-border">
          <div className="flex justify-between font-bold text-sm p-3 rounded-lg bg-muted text-foreground">
            <span>TOTAL LIABILITIES & EQUITY (II + III)</span>
            <span>
              ₹
              {report.balanceCheck.liabilitiesAndEquityTotal.toLocaleString("en-IN", {
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
