import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { balanceSheetService } from "@/lib/services/reports/balance-sheet.service";
import { CheckCircle2, AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BalanceSheetPage() {
  const report = await balanceSheetService.generate();

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Balance Sheet"
        description="Financial statement summarizing assets, liabilities, and shareholders' equity at a specific point in time."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print / Export
            </Button>
          </div>
        }
      />

      {/* Accounting equation banner */}
      <div
        className={`p-4 rounded-lg border flex items-center justify-between ${
          report.isBalanced
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
            : "bg-amber-50/80 border-amber-200 text-amber-800"
        }`}
      >
        <div className="flex items-center gap-2 font-medium text-sm">
          {report.isBalanced ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          )}
          <span>
            {report.isBalanced
              ? "Accounting Equation Balanced: Assets = Liabilities + Equity"
              : "Warning: Assets does not equal Liabilities + Equity"}
          </span>
        </div>
        <div className="text-sm font-semibold">
          ${Number(report.totalAssets).toFixed(2)} = ${(
            Number(report.totalLiabilities) + Number(report.totalEquity)
          ).toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50/70 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                1. Assets
              </CardTitle>
              <span className="text-sm font-bold text-gray-900">
                ${Number(report.totalAssets).toFixed(2)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {report.assets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No asset accounts found.
              </p>
            ) : (
              report.assets.map((acc) => (
                <div
                  key={acc.id}
                  className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">
                    {acc.code && (
                      <span className="text-xs text-muted-foreground mr-2 font-mono">
                        {acc.code}
                      </span>
                    )}
                    {acc.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${Number(acc.balance).toFixed(2)}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-gray-900">
              <span>Total Assets</span>
              <span>${Number(report.totalAssets).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50/70 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">
                  2. Liabilities
                </CardTitle>
                <span className="text-sm font-bold text-gray-900">
                  ${Number(report.totalLiabilities).toFixed(2)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {report.liabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No liability accounts found.
                </p>
              ) : (
                report.liabilities.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">
                      {acc.code && (
                        <span className="text-xs text-muted-foreground mr-2 font-mono">
                          {acc.code}
                        </span>
                      )}
                      {acc.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${Number(acc.balance).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-gray-900">
                <span>Total Liabilities</span>
                <span>${Number(report.totalLiabilities).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50/70 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">
                  3. Equity
                </CardTitle>
                <span className="text-sm font-bold text-gray-900">
                  ${Number(report.totalEquity).toFixed(2)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {report.equity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No equity accounts found.
                </p>
              ) : (
                report.equity.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">
                      {acc.code && (
                        <span className="text-xs text-muted-foreground mr-2 font-mono">
                          {acc.code}
                        </span>
                      )}
                      {acc.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${Number(acc.balance).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-gray-900">
                <span>Total Equity</span>
                <span>${Number(report.totalEquity).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
