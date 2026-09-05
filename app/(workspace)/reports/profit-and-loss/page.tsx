import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profitLossReportService } from "@/lib/services/reports/profit-loss.service";
import { TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfitAndLossPage() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  const report = await profitLossReportService.generateReport({ startDate, endDate });
  const netProfitNum = Number(report.netProfit);
  const totalIncomeNum = Number(report.totalIncome);
  const totalExpensesNum = Number(report.totalExpenses);
  const isProfitable = netProfitNum >= 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Profit & Loss Statement"
        description="Income statement showing revenues, costs, and net earnings over the fiscal period."
      />

      {/* Net Profit Banner */}
      <Card
        className={`rounded-xl border shadow-card overflow-hidden ${
          isProfitable ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/60 border-red-200"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  isProfitable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {isProfitable ? "Net Operating Profit" : "Net Operating Loss"}
                </p>
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isProfitable ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  ₹{Math.abs(netProfitNum).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <div className="text-xs space-y-1 sm:text-right">
              <p className="text-muted-foreground">
                Total Revenue: <span className="font-semibold text-foreground">₹{totalIncomeNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </p>
              <p className="text-muted-foreground">
                Total Expenses: <span className="font-semibold text-foreground">₹{totalExpensesNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenues */}
        <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
          <CardHeader className="bg-[#F9FAFB] border-b border-border py-3 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-navy">
                Operating Revenue
              </CardTitle>
              <span className="text-sm font-bold text-emerald-700">
                ₹{totalIncomeNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {report.incomeAccounts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No revenue recorded in this period.
              </p>
            ) : (
              report.incomeAccounts.map((r) => (
                <div
                  key={r.accountId}
                  className="flex justify-between items-center py-2 text-xs border-b border-border/60 last:border-0"
                >
                  <span className="text-foreground">
                    {r.name}
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(r.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-sm text-navy">
              <span>Total Revenue</span>
              <span className="text-emerald-700">₹{totalIncomeNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
          <CardHeader className="bg-[#F9FAFB] border-b border-border py-3 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-navy">
                Operating Expenses
              </CardTitle>
              <span className="text-sm font-bold text-navy">
                ₹{totalExpensesNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {report.expenseAccounts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No expenses recorded in this period.
              </p>
            ) : (
              report.expenseAccounts.map((e) => (
                <div
                  key={e.accountId}
                  className="flex justify-between items-center py-2 text-xs border-b border-border/60 last:border-0"
                >
                  <span className="text-foreground">
                    {e.name}
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(e.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-sm text-navy">
              <span>Total Expenses</span>
              <span>₹{totalExpensesNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
