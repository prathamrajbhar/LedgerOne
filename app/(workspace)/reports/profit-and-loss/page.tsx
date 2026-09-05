import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profitAndLossService } from "@/lib/services/reports/profit-and-loss.service";
import { TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfitAndLossPage() {
  const report = await profitAndLossService.generate();
  const isProfitable = Number(report.netProfit) >= 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Profit & Loss Statement"
        description="Income statement showing revenues, costs, and net earnings over the fiscal period."
      />

      {/* Net Profit Banner */}
      <Card
        className={`${
          isProfitable ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
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
                <p className="text-sm font-medium text-gray-700">
                  {isProfitable ? "Net Operating Profit" : "Net Operating Loss"}
                </p>
                <h2
                  className={`text-3xl font-bold tracking-tight ${
                    isProfitable ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  ${Math.abs(Number(report.netProfit)).toFixed(2)}
                </h2>
              </div>
            </div>
            <div className="text-sm space-y-1 sm:text-right">
              <p className="text-gray-600">
                Total Revenue: <span className="font-semibold text-gray-900">${Number(report.totalRevenue).toFixed(2)}</span>
              </p>
              <p className="text-gray-600">
                Total Expenses: <span className="font-semibold text-gray-900">${Number(report.totalExpenses).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenues */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50/70 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                Operating Revenue
              </CardTitle>
              <span className="text-sm font-bold text-emerald-700">
                ${Number(report.totalRevenue).toFixed(2)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {report.revenues.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No revenue recorded in this period.
              </p>
            ) : (
              report.revenues.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">
                    {r.code && (
                      <span className="text-xs text-muted-foreground mr-2 font-mono">
                        {r.code}
                      </span>
                    )}
                    {r.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${Number(r.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-gray-900">
              <span>Total Revenue</span>
              <span className="text-emerald-700">${Number(report.totalRevenue).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50/70 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                Operating Expenses
              </CardTitle>
              <span className="text-sm font-bold text-gray-900">
                ${Number(report.totalExpenses).toFixed(2)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {report.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No expenses recorded in this period.
              </p>
            ) : (
              report.expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">
                    {e.code && (
                      <span className="text-xs text-muted-foreground mr-2 font-mono">
                        {e.code}
                      </span>
                    )}
                    {e.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${Number(e.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-gray-900">
              <span>Total Expenses</span>
              <span>${Number(report.totalExpenses).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
