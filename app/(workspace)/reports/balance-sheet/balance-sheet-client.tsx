"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { ArrowLeft, Printer, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { generateBalanceSheetAction } from "@/app/actions/accounting.actions";
import { toast } from "sonner";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";

export function BalanceSheetClient({ initialReport }: { initialReport: BalanceSheetReport }) {
  const [report, setReport] = React.useState<BalanceSheetReport>(initialReport);
  const [asOfDate, setAsOfDate] = React.useState(
    new Date(initialReport.asOfDate).toISOString().split("T")[0]
  );
  const [loading, setLoading] = React.useState(false);

  const fetchReport = async (dateStr: string) => {
    setLoading(true);
    try {
      const result = await generateBalanceSheetAction({ asOfDate: new Date(dateStr) });
      if (result.success && result.data) {
        setReport(result.data as BalanceSheetReport);
        return;
      }
      toast.error(result.error || "Failed to generate Balance Sheet");
    } catch {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setAsOfDate(newDate);
    fetchReport(newDate);
  };

  const handleExportCSV = () => {
    let csv = `Balance Sheet as of ${asOfDate}\n\n`;
    csv += "Section,Account,Balance\n";
    report.assets.accounts.forEach((a) => {
      csv += `Assets,"${a.accountName}",${a.balance}\n`;
    });
    csv += `Assets,Total Assets,${report.assets.total}\n\n`;
    report.liabilities.accounts.forEach((a) => {
      csv += `Liabilities,"${a.accountName}",${a.balance}\n`;
    });
    csv += `Liabilities,Total Liabilities,${report.liabilities.total}\n\n`;
    report.equity.accounts.forEach((a) => {
      csv += `Equity,"${a.accountName}",${a.balance}\n`;
    });
    csv += `Equity,Total Equity,${report.equity.total}\n\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Balance_Sheet_${asOfDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Balance sheet exported to CSV");
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/reports" className="inline-flex items-center text-xs text-muted-foreground hover:text-navy mb-1.5">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Reports
          </Link>
          <h1 className="text-xl font-bold text-navy">Balance Sheet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Assets, Liabilities, and Equity as of {asOfDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-44">
            <FormInput label="" type="date" value={asOfDate} onChange={(e) => handleDateChange(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5 h-9 mt-1.5">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5 h-9 mt-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex items-center justify-between ${report.balanceCheck.isBalanced ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        <div className="flex items-center gap-2.5">
          {report.balanceCheck.isBalanced ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
          <div>
            <div className="text-xs font-bold">{report.balanceCheck.isBalanced ? "Accounting Equation Verified: Assets = Liabilities + Equity" : "Out of Balance Notice"}</div>
            <div className="text-[11px] opacity-80">Assets: {fmt(report.balanceCheck.assetsTotal)} | Liab + Eq: {fmt(report.balanceCheck.liabilitiesAndEquityTotal)}</div>
          </div>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-navy" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
          <div className="px-5 py-3.5 bg-primary-light/50 border-b border-border flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy">Assets</h2>
            <span className="font-mono font-bold text-sm text-navy">{fmt(report.assets.total)}</span>
          </div>
          <div className="divide-y divide-border p-2">
            {report.assets.accounts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No asset accounts found</div>
            ) : (
              report.assets.accounts.map((acc) => (
                <div key={acc.accountId} className="flex justify-between py-2.5 px-3 text-xs">
                  <span className="font-medium text-foreground">{acc.accountName}</span>
                  <span className="font-mono text-foreground font-semibold">{fmt(acc.balance)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3.5 bg-primary-light/50 border-b border-border flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy">Liabilities</h2>
              <span className="font-mono font-bold text-sm text-navy">{fmt(report.liabilities.total)}</span>
            </div>
            <div className="divide-y divide-border p-2">
              {report.liabilities.accounts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No liability accounts found</div>
              ) : (
                report.liabilities.accounts.map((acc) => (
                  <div key={acc.accountId} className="flex justify-between py-2.5 px-3 text-xs">
                    <span className="font-medium text-foreground">{acc.accountName}</span>
                    <span className="font-mono text-foreground font-semibold">{fmt(acc.balance)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3.5 bg-primary-light/50 border-b border-border flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy">Owner&apos;s Equity</h2>
              <span className="font-mono font-bold text-sm text-navy">{fmt(report.equity.total)}</span>
            </div>
            <div className="divide-y divide-border p-2">
              {report.equity.accounts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No equity accounts found</div>
              ) : (
                report.equity.accounts.map((acc) => (
                  <div key={acc.accountId} className="flex justify-between py-2.5 px-3 text-xs">
                    <span className="font-medium text-foreground">{acc.accountName}</span>
                    <span className="font-mono text-foreground font-semibold">{fmt(acc.balance)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
