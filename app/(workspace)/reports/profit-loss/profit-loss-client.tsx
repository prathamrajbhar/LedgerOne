"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { ArrowLeft, Printer, Download, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { generateProfitLossReportAction } from "@/app/actions/accounting.actions";
import { toast } from "sonner";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";

export function ProfitLossClient({ initialReport }: { initialReport: ProfitLossReport }) {
  const [report, setReport] = React.useState<ProfitLossReport>(initialReport);
  const [startDate, setStartDate] = React.useState(
    new Date(initialReport.dateRange.startDate).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = React.useState(
    new Date(initialReport.dateRange.endDate).toISOString().split("T")[0]
  );
  const [loading, setLoading] = React.useState(false);

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const result = await generateProfitLossReportAction({
        startDate: new Date(start),
        endDate: new Date(end),
      });
      if (result.success && result.data) {
        setReport(result.data as ProfitLossReport);
        return;
      }
      toast.error(result.error || "Failed to generate Profit & Loss report");
    } catch {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(startDate, endDate);
  };

  const handleExportCSV = () => {
    let csv = `Profit and Loss Statement: ${startDate} to ${endDate}\n\n`;
    csv += "Type,Account,Amount\n";
    report.incomeAccounts.forEach((a) => {
      csv += `Income,"${a.name}",${Number(a.balance)}\n`;
    });
    csv += `Income,Total Revenue,${Number(report.totalIncome)}\n\n`;
    report.expenseAccounts.forEach((a) => {
      csv += `Expense,"${a.name}",${Number(a.balance)}\n`;
    });
    csv += `Expense,Total Expenses,${Number(report.totalExpenses)}\n\n`;
    csv += `Summary,Net Profit,${Number(report.netProfit)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Profit_and_Loss_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("P&L Statement exported to CSV");
  };

  const fmt = (n: number | { toString: () => string }) =>
    `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const isProfitable = Number(report.netProfit) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/reports" className="inline-flex items-center text-xs text-muted-foreground hover:text-navy mb-1.5">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Reports
          </Link>
          <h1 className="text-xl font-bold text-navy">Profit & Loss Statement</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Performance from {startDate} to {endDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5 h-9">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5 h-9">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-border bg-white shadow-card">
        <div className="w-40">
          <FormInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="w-40">
          <FormInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} size="sm" className="h-9 text-xs bg-navy text-white gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update Report"}
        </Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</span>
          <div className="text-xl font-bold font-mono text-teal mt-1">{fmt(report.totalIncome)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</span>
          <div className="text-xl font-bold font-mono text-destructive mt-1">{fmt(report.totalExpenses)}</div>
        </div>
        <div className={`p-4 rounded-xl border shadow-card ${isProfitable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isProfitable ? "text-green-800" : "text-red-800"}`}>
              {isProfitable ? "Net Profit" : "Net Loss"}
            </span>
            {isProfitable ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${isProfitable ? "text-green-700" : "text-red-700"}`}>
            {fmt(report.netProfit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
          <div className="px-5 py-3.5 bg-teal/10 border-b border-border flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-dark">Revenue Accounts</h2>
            <span className="font-mono font-bold text-sm text-teal-dark">{fmt(report.totalIncome)}</span>
          </div>
          <div className="divide-y divide-border p-2">
            {report.incomeAccounts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No income recorded for this period</div>
            ) : (
              report.incomeAccounts.map((acc) => (
                <div key={acc.accountId} className="flex justify-between py-2.5 px-3 text-xs">
                  <span className="font-medium text-foreground">{acc.name}</span>
                  <span className="font-mono text-foreground font-semibold">{fmt(acc.balance)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
          <div className="px-5 py-3.5 bg-destructive/10 border-b border-border flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-destructive">Expense Accounts</h2>
            <span className="font-mono font-bold text-sm text-destructive">{fmt(report.totalExpenses)}</span>
          </div>
          <div className="divide-y divide-border p-2">
            {report.expenseAccounts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No expenses recorded for this period</div>
            ) : (
              report.expenseAccounts.map((acc) => (
                <div key={acc.accountId} className="flex justify-between py-2.5 px-3 text-xs">
                  <span className="font-medium text-foreground">{acc.name}</span>
                  <span className="font-mono text-foreground font-semibold">{fmt(acc.balance)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
