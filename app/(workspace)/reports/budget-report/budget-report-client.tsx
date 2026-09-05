"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { ArrowLeft, Printer, Download, PieChart, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { BudgetDetailData } from "../../budgets/[id]/budget-detail-client";

interface BudgetReportClientProps {
  budgets: BudgetDetailData[];
}

export function BudgetReportClient({ budgets }: BudgetReportClientProps) {
  const [selectedId, setSelectedId] = React.useState(budgets[0]?.id || "");

  const activeBudget = budgets.find((b) => b.id === selectedId) || budgets[0];

  const handleExportCSV = () => {
    if (!activeBudget) return;
    let csv = `Budget Performance Report: ${activeBudget.name}\n`;
    csv += `Period: ${activeBudget.startDate} to ${activeBudget.endDate}\n\n`;
    csv += "Analytic Account,Type,Committed,Achieved,Remaining,Achievement %\n";

    activeBudget.lines.forEach((l) => {
      csv += `"${l.analyticAccountName}",${l.type},${l.committedAmount},${l.achievedAmount},${l.amountToAchieve},${l.achievedPercent}%\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Budget_Report_${activeBudget.name.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Budget report exported to CSV");
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (!activeBudget) {
    return (
      <div className="space-y-6">
        <Link href="/reports" className="inline-flex items-center text-xs text-muted-foreground hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Reports
        </Link>
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-card">
          <PieChart className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-foreground">No Budgets Available</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Create and confirm a budget first to review performance.</p>
          <Link href="/budgets/new">
            <Button size="sm" className="text-xs bg-navy text-white">Create Budget</Button>
          </Link>
        </div>
      </div>
    );
  }

  const variance = activeBudget.totalCommitted - activeBudget.totalAchieved;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/reports" className="inline-flex items-center text-xs text-muted-foreground hover:text-navy mb-1.5">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Reports
          </Link>
          <h1 className="text-xl font-bold text-navy">Budget Performance & Variance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Evaluate actual spending against committed targets.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-60">
            <FormSelect
              label=""
              value={selectedId}
              onValueChange={(val) => setSelectedId(val)}
              options={budgets.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5 h-9 mt-1.5">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5 h-9 mt-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Committed Target</span>
          <div className="text-xl font-bold font-mono text-foreground mt-1">{fmt(activeBudget.totalCommitted)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Actual Achieved</span>
          <div className="text-xl font-bold font-mono text-navy mt-1">{fmt(activeBudget.totalAchieved)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Remaining Variance</span>
          <div className="text-xl font-bold font-mono text-foreground mt-1">{fmt(variance)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Realization</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-teal">{activeBudget.overallRate}%</span>
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-teal" style={{ width: `${Math.min(activeBudget.overallRate, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-[#F9FAFB] flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Variance Breakdown by Cost Center</h2>
          <span className="text-xs font-semibold text-navy">Budget Status: {activeBudget.status}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="py-3 px-4">Analytic Account</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Committed</th>
                <th className="py-3 px-4 text-right">Actuals</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center min-w-[150px]">Achievement %</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeBudget.lines.map((line) => {
                const isOverBudget = line.achievedPercent > 100;
                return (
                  <tr key={line.id} className="hover:bg-primary-light/30">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{line.analyticAccountName}</td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{line.type}</span></td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium">{fmt(line.committedAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-navy">{fmt(line.achievedAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">{fmt(line.amountToAchieve)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${isOverBudget ? "bg-amber-500" : "bg-teal"}`} style={{ width: `${Math.min(line.achievedPercent, 100)}%` }} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold">{line.achievedPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isOverBudget ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Exceeded
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
