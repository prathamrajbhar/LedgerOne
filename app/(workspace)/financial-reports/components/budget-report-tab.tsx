"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Target, TrendingUp, Layers } from "lucide-react";

import type { BudgetReportItem } from "../types";

interface BudgetReportTabProps {
  budgets: BudgetReportItem[] | null;
  onRefresh: () => void;
  loading: boolean;
}

export function BudgetReportTab({
  budgets,
  onRefresh,
  loading,
}: BudgetReportTabProps) {
  if (!budgets) return null;

  // Aggregate totals across confirmed budgets
  let totalCommitted = 0;
  let totalAchieved = 0;

  budgets.forEach((b) => {
    b.lines.forEach((l) => {
      totalCommitted += Number(l.committedAmount);
      totalAchieved += Number(l.achievedAmount);
    });
  });

  const overallPercent =
    totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              Total Budget Planned
            </span>
            <span className="text-lg font-bold text-foreground">
              ₹
              {totalCommitted.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F1] text-success flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              Total Actuals Realized
            </span>
            <span className="text-lg font-bold text-foreground">
              ₹
              {totalAchieved.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6] text-warning flex-shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              Overall Budget Utilization
            </span>
            <span className="text-lg font-bold text-foreground">
              {overallPercent}%
            </span>
          </div>
        </Card>
      </div>

      {/* Itemized Budgets Table */}
      <Card className="p-5 bg-white shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Department & Sector Budget Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">
              Planned amounts vs actual accounting records across analytic cost/revenue centers.
            </p>
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

        {budgets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No budgets found in the system.
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="border border-border rounded-xl overflow-hidden"
              >
                <div className="bg-[#F9FAFB] p-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-foreground text-xs">{budget.name}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Period: {new Date(budget.startDate).toLocaleDateString("en-IN")}{" "}
                      to {new Date(budget.endDate).toLocaleDateString("en-IN")} •
                      Responsible: {budget.responsible?.name || "Unassigned"}
                    </p>
                  </div>
                  <StatusBadge status={budget.status} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-white">
                        <th className="py-2 px-4">Analytic Account</th>
                        <th className="py-2 px-4">Type</th>
                        <th className="py-2 px-4 text-right">Planned (₹)</th>
                        <th className="py-2 px-4 text-right">Achieved (₹)</th>
                        <th className="py-2 px-4 text-center">Achievement %</th>
                        <th className="py-2 px-4 text-right">Remaining (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {budget.lines.map((line) => {
                        const planned = Number(line.committedAmount);
                        const achieved = Number(line.achievedAmount);
                        const percent = Number(line.achievedPercent);
                        const remaining = Number(line.amountToAchieve);

                        return (
                          <tr key={line.id} className="hover:bg-primary-light/20">
                            <td className="py-2 px-4 font-semibold text-foreground">
                              {line.analyticAccount.name}
                            </td>
                            <td className="py-2 px-4 text-muted-foreground uppercase text-[11px]">
                              {line.type}
                            </td>
                            <td className="py-2 px-4 text-right font-mono">
                              ₹{planned.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-navy">
                              ₹{achieved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  percent >= 100
                                    ? "bg-success/15 text-success"
                                    : percent >= 50
                                    ? "bg-warning/15 text-warning"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {percent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-muted-foreground">
                              ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
