"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  generateProfitLossReportAction,
  generateBalanceSheetAction,
  generateStockReportAction,
  generateBudgetReportAction,
} from "@/app/actions/accounting.actions";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";
import type { StockReport } from "@/lib/services/reports/stock-report.service";
import { ProfitLossTab } from "./components/profit-loss-tab";
import { BalanceSheetTab } from "./components/balance-sheet-tab";
import { StockValuationTab } from "./components/stock-valuation-tab";
import { BudgetReportTab } from "./components/budget-report-tab";
import type { BudgetReportItem } from "./types";

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = React.useState("pl");
  const [plStartDate, setPlStartDate] = React.useState(() => {
    const date = new Date();
    const fyStart = new Date(date.getFullYear(), 3, 1);
    if (date < fyStart) fyStart.setFullYear(fyStart.getFullYear() - 1);
    return fyStart.toISOString().split("T")[0];
  });
  const [plEndDate, setPlEndDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [bsDate, setBsDate] = React.useState(() => new Date().toISOString().split("T")[0]);

  const [plReport, setPlReport] = React.useState<ProfitLossReport | null>(null);
  const [bsReport, setBsReport] = React.useState<BalanceSheetReport | null>(null);
  const [stockReport, setStockReport] = React.useState<StockReport | null>(null);
  const [budgets, setBudgets] = React.useState<BudgetReportItem[] | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plResult, bsResult, stockResult, budgetResult] = await Promise.all([
        generateProfitLossReportAction({ startDate: new Date(plStartDate), endDate: new Date(plEndDate) }),
        generateBalanceSheetAction({ asOfDate: new Date(bsDate) }),
        generateStockReportAction(),
        generateBudgetReportAction(),
      ]);

      if (plResult.success && plResult.data) setPlReport(plResult.data);
      if (bsResult.success && bsResult.data) setBsReport(bsResult.data);
      if (stockResult.success && stockResult.data) setStockReport(stockResult.data as StockReport);
      if (budgetResult.success && budgetResult.data) setBudgets(budgetResult.data as unknown as BudgetReportItem[]);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [plStartDate, plEndDate, bsDate]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = () => {
    let csv = `Financial Reports Export - ${activeTab.toUpperCase()}\n\n`;

    if (activeTab === "pl" && plReport) {
      csv += `PROFIT & LOSS STATEMENT (${plStartDate} to ${plEndDate})\n\nINCOME\nAccount,Amount\n`;
      plReport.incomeAccounts.forEach((acc) => (csv += `"${acc.name}",${Number(acc.balance)}\n`));
      csv += `Total Income,${Number(plReport.totalIncome)}\n\nEXPENSES\nAccount,Amount\n`;
      plReport.expenseAccounts.forEach((acc) => (csv += `"${acc.name}",${Number(acc.balance)}\n`));
      csv += `Total Expenses,${Number(plReport.totalExpenses)}\nNet Profit,${Number(plReport.netProfit)}\n`;
    } else if (activeTab === "bs" && bsReport) {
      csv += `BALANCE SHEET (As of ${bsDate})\n\nASSETS\nAccount,Amount\n`;
      bsReport.assets.accounts.forEach((acc) => (csv += `"${acc.accountName}",${acc.balance}\n`));
      csv += `Total Assets,${bsReport.assets.total}\n\nLIABILITIES\nAccount,Amount\n`;
      bsReport.liabilities.accounts.forEach((acc) => (csv += `"${acc.accountName}",${acc.balance}\n`));
      csv += `Total Equity,${bsReport.equity.total}\n`;
    } else if (activeTab === "stock" && stockReport) {
      csv += `STOCK & INVENTORY VALUATION REPORT\n\nSKU,Product Name,Category,Stock,Cost,Total Valuation,Status\n`;
      stockReport.items.forEach((item) => {
        csv += `"${item.sku}","${item.name}","${item.category}",${item.stock},${item.cost},${item.totalValuation},"${item.status}"\n`;
      });
      csv += `\nTotal Stock Valuation,${stockReport.summary.totalStockValuation}\n`;
    } else if (activeTab === "budget" && budgets) {
      csv += `BUDGET OVERVIEW REPORT\n\nBudget Name,Analytic Account,Type,Planned,Achieved,Achievement %,Remaining\n`;
      budgets.forEach((b) => {
        b.lines.forEach((l) => {
          csv += `"${b.name}","${l.analyticAccount?.name || ""}","${l.type}",${l.committedAmount},${l.achievedAmount},"${Number(l.achievedPercent).toFixed(1)}%",${l.amountToAchieve}\n`;
        });
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported to CSV");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Financial & Stock Reports"
        description="Statutory double-entry accounting statements, inventory valuation, and budget performance."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="text-xs gap-1.5" disabled={loading || !!error}>
              <Printer className="h-3.5 w-3.5" /> Print Statement
            </Button>
            <Button size="sm" onClick={handleExportCSV} className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm" disabled={loading || !!error}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        }
      />

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

      {loading && (
        <Card className="p-12 bg-white shadow-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-sm text-muted-foreground">Generating statutory reports...</p>
        </Card>
      )}

      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#F6F7F9] border border-border p-1 w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="pl" className="text-xs whitespace-nowrap">Profit & Loss</TabsTrigger>
            <TabsTrigger value="bs" className="text-xs whitespace-nowrap">Balance Sheet</TabsTrigger>
            <TabsTrigger value="stock" className="text-xs whitespace-nowrap">Stock Valuation</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs whitespace-nowrap">Budget Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="pl">
            <ProfitLossTab report={plReport} startDate={plStartDate} endDate={plEndDate} onStartDateChange={setPlStartDate} onEndDateChange={setPlEndDate} onRefresh={fetchReports} loading={loading} />
          </TabsContent>

          <TabsContent value="bs">
            <BalanceSheetTab report={bsReport} asOfDate={bsDate} onAsOfDateChange={setBsDate} onRefresh={fetchReports} loading={loading} />
          </TabsContent>

          <TabsContent value="stock">
            <StockValuationTab report={stockReport} onRefresh={fetchReports} loading={loading} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetReportTab budgets={budgets} onRefresh={fetchReports} loading={loading} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
