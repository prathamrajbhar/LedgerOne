"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateProfitLossReportAction, generateBalanceSheetAction } from "@/app/actions/accounting.actions";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";

export default function FinancialReportsPage() {
  // Date range state
  const [plStartDate, setPlStartDate] = React.useState(() => {
    const date = new Date();
    const fiscalYearStart = new Date(date.getFullYear(), 3, 1); // April 1
    if (date < fiscalYearStart) {
      fiscalYearStart.setFullYear(fiscalYearStart.getFullYear() - 1);
    }
    return fiscalYearStart.toISOString().split("T")[0];
  });

  const [plEndDate, setPlEndDate] = React.useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [bsDate, setBsDate] = React.useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Report data state
  const [plReport, setPlReport] = React.useState<ProfitLossReport | null>(null);
  const [bsReport, setBsReport] = React.useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch reports
  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [plResult, bsResult] = await Promise.all([
        generateProfitLossReportAction({
          startDate: new Date(plStartDate),
          endDate: new Date(plEndDate),
        }),
        generateBalanceSheetAction({
          asOfDate: new Date(bsDate),
        }),
      ]);

      if (!plResult.success) {
        throw new Error(plResult.error || "Failed to generate P&L report");
      }
      if (!bsResult.success) {
        throw new Error(bsResult.error || "Failed to generate Balance Sheet");
      }

      setPlReport(plResult.data || null);
      setBsReport(bsResult.data || null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [plStartDate, plEndDate, bsDate]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = () => {
    if (!plReport || !bsReport) return;

    let csv = "Financial Reports Export\n\n";

    // Profit & Loss
    csv += "PROFIT & LOSS STATEMENT\n";
    csv += `Period: ${new Date(plStartDate).toLocaleDateString("en-IN")} to ${new Date(plEndDate).toLocaleDateString("en-IN")}\n\n`;
    csv += "INCOME\n";
    csv += "Account,Amount\n";
    plReport.incomeAccounts.forEach((acc) => {
      csv += `"${acc.name}",${Number(acc.balance)}\n`;
    });
    csv += `Total Income,${Number(plReport.totalIncome)}\n\n`;

    csv += "EXPENSES\n";
    csv += "Account,Amount\n";
    plReport.expenseAccounts.forEach((acc) => {
      csv += `"${acc.name}",${Number(acc.balance)}\n`;
    });
    csv += `Total Expenses,${Number(plReport.totalExpenses)}\n\n`;
    csv += `Net Profit,${Number(plReport.netProfit)}\n\n\n`;

    // Balance Sheet
    csv += "BALANCE SHEET\n";
    csv += `As of: ${new Date(bsDate).toLocaleDateString("en-IN")}\n\n`;
    csv += "ASSETS\n";
    csv += "Account,Amount\n";
    bsReport.assets.accounts.forEach((acc) => {
      csv += `"${acc.accountName}",${acc.balance}\n`;
    });
    csv += `Total Assets,${bsReport.assets.total}\n\n`;

    csv += "LIABILITIES\n";
    csv += "Account,Amount\n";
    bsReport.liabilities.accounts.forEach((acc) => {
      csv += `"${acc.accountName}",${acc.balance}\n`;
    });
    csv += `Total Liabilities,${bsReport.liabilities.total}\n\n`;

    csv += "EQUITY\n";
    csv += "Account,Amount\n";
    bsReport.equity.accounts.forEach((acc) => {
      csv += `"${acc.accountName}",${acc.balance}\n`;
    });
    csv += `Total Equity,${bsReport.equity.total}\n\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Financial reports exported to CSV");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Financial Statements & Reports"
        description="Statutory double-entry accounting statements: Profit & Loss, Balance Sheet, and Trial Balance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5"
              disabled={loading || !!error}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Statement
            </Button>
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
              disabled={loading || !!error}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-white shadow-card">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Failed to load financial reports</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12 bg-white shadow-card">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
            <p className="text-sm text-muted-foreground">Generating financial reports...</p>
          </div>
        </Card>
      )}

      {/* P&L Statement Card */}
      {!loading && !error && plReport && (
        <Card className="p-6 bg-white shadow-card">
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Statement of Profit & Loss (P&L)
                </h2>
                <p className="text-xs text-muted-foreground">
                  For the Period: {new Date(plStartDate).toLocaleDateString("en-IN")} to {new Date(plEndDate).toLocaleDateString("en-IN")}
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
                  value={plStartDate}
                  onChange={(e) => setPlStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={plEndDate}
                  onChange={(e) => setPlEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background"
                />
              </div>
              <Button
                size="sm"
                onClick={fetchReports}
                disabled={loading}
                className="text-xs"
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
                <span>₹{Number(plReport.totalIncome).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {plReport.incomeAccounts.length > 0 ? (
                <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
                  {plReport.incomeAccounts.map((acc) => (
                    <div key={acc.accountId} className="flex justify-between">
                      <span>{acc.name}</span>
                      <span className="text-foreground font-medium">
                        ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 pl-3 text-muted-foreground text-xs italic">
                  No income transactions in this period
                </div>
              )}
            </div>

            {/* Expenses */}
            <div>
              <div className="flex justify-between font-bold text-sm text-foreground pb-1 border-b border-border">
                <span>II. EXPENSES</span>
                <span>₹{Number(plReport.totalExpenses).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {plReport.expenseAccounts.length > 0 ? (
                <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
                  {plReport.expenseAccounts.map((acc) => (
                    <div key={acc.accountId} className="flex justify-between">
                      <span>{acc.name}</span>
                      <span className="text-foreground font-medium">
                        ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 pl-3 text-muted-foreground text-xs italic">
                  No expense transactions in this period
                </div>
              )}
            </div>

            {/* Net Profit */}
            <div className="pt-2 border-t-2 border-navy flex justify-between items-center text-base font-bold text-navy">
              <span>NET PROFIT BEFORE TAX (I - II)</span>
              <span className={`text-lg ${Number(plReport.netProfit) >= 0 ? "text-success" : "text-destructive"}`}>
                ₹{Number(plReport.netProfit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Balance Sheet Summary */}
      {!loading && !error && bsReport && (
        <Card className="p-6 bg-white shadow-card">
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Balance Sheet Overview
                </h2>
                <p className="text-xs text-muted-foreground">
                  As of {new Date(bsDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              {!bsReport.balanceCheck.isBalanced && (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Unbalanced
                </div>
              )}
            </div>

            {/* Date Selector */}
            <div className="flex items-end gap-3 pt-3 border-t border-border">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  As of Date
                </label>
                <input
                  type="date"
                  value={bsDate}
                  onChange={(e) => setBsDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background"
                />
              </div>
              <Button
                size="sm"
                onClick={fetchReports}
                disabled={loading}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Assets */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-navy pb-1 border-b border-border">
                ASSETS
              </h3>
              {bsReport.assets.accounts.length > 0 ? (
                <>
                  {bsReport.assets.accounts.map((acc) => (
                    <div key={acc.accountId} className="flex justify-between text-muted-foreground">
                      <span>{acc.accountName}</span>
                      <span className="text-foreground font-medium">
                        ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-2 text-muted-foreground text-xs italic">
                  No asset accounts found
                </div>
              )}
              <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground text-sm">
                <span>TOTAL ASSETS</span>
                <span className="text-navy font-bold">
                  ₹{bsReport.assets.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-navy pb-1 border-b border-border">
                LIABILITIES & EQUITY
              </h3>

              {/* Liabilities */}
              {bsReport.liabilities.accounts.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-muted-foreground pt-1">Liabilities</div>
                  {bsReport.liabilities.accounts.map((acc) => (
                    <div key={acc.accountId} className="flex justify-between text-muted-foreground pl-2">
                      <span>{acc.accountName}</span>
                      <span className="text-foreground font-medium">
                        ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Equity */}
              {bsReport.equity.accounts.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-muted-foreground pt-1">Equity</div>
                  {bsReport.equity.accounts.map((acc) => (
                    <div key={acc.accountId} className="flex justify-between text-muted-foreground pl-2">
                      <span>{acc.accountName}</span>
                      <span className="text-foreground font-medium">
                        ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {bsReport.liabilities.accounts.length === 0 && bsReport.equity.accounts.length === 0 && (
                <div className="py-2 text-muted-foreground text-xs italic">
                  No liability or equity accounts found
                </div>
              )}

              <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground text-sm">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="text-navy font-bold">
                  ₹{bsReport.balanceCheck.liabilitiesAndEquityTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Check Alert */}
          {!bsReport.balanceCheck.isBalanced && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Accounting Equation Imbalance Detected</p>
                  <p className="text-muted-foreground mt-1">
                    Assets (₹{bsReport.balanceCheck.assetsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                    {" ≠ "}
                    Liabilities + Equity (₹{bsReport.balanceCheck.liabilitiesAndEquityTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Difference: ₹{Math.abs(bsReport.balanceCheck.assetsTotal - bsReport.balanceCheck.liabilitiesAndEquityTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
