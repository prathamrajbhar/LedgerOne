import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { balanceSheetService } from "@/lib/services/reports/balance-sheet.service";
import { CheckCircle2, AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BalanceSheetPage() {
  const report = await balanceSheetService.generate();
  const isBalanced = report.balanceCheck.isBalanced;
  const totalAssets = report.assets.total;
  const totalLiabilities = report.liabilities.total;
  const totalEquity = report.equity.total;

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
              className="gap-1.5 text-xs border-border"
            >
              <Printer className="h-4 w-4" /> Print / Export
            </Button>
          </div>
        }
      />

      {/* Accounting equation banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between shadow-card ${
          isBalanced
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
            : "bg-amber-50/80 border-amber-200 text-amber-800"
        }`}
      >
        <div className="flex items-center gap-2 font-medium text-sm">
          {isBalanced ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          )}
          <span>
            {isBalanced
              ? "Accounting Equation Balanced: Assets = Liabilities + Equity"
              : "Warning: Assets does not equal Liabilities + Equity"}
          </span>
        </div>
        <div className="text-sm font-semibold">
          ₹{Number(totalAssets).toLocaleString("en-IN", { minimumFractionDigits: 2 })} = ₹{(
            Number(totalLiabilities) + Number(totalEquity)
          ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
          <CardHeader className="bg-[#F9FAFB] border-b border-border py-3 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-navy">
                1. Assets
              </CardTitle>
              <span className="text-sm font-bold text-navy">
                ₹{Number(totalAssets).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {report.assets.accounts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No asset accounts found.
              </p>
            ) : (
              report.assets.accounts.map((acc) => (
                <div
                  key={acc.accountId}
                  className="flex justify-between items-center py-2 text-xs border-b border-border/60 last:border-0"
                >
                  <span className="text-foreground">
                    {acc.accountName}
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-sm text-navy">
              <span>Total Assets</span>
              <span>₹{Number(totalAssets).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
            <CardHeader className="bg-[#F9FAFB] border-b border-border py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-navy">
                  2. Liabilities
                </CardTitle>
                <span className="text-sm font-bold text-navy">
                  ₹{Number(totalLiabilities).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-2">
              {report.liabilities.accounts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No liability accounts found.
                </p>
              ) : (
                report.liabilities.accounts.map((acc) => (
                  <div
                    key={acc.accountId}
                    className="flex justify-between items-center py-2 text-xs border-b border-border/60 last:border-0"
                  >
                    <span className="text-foreground">
                      {acc.accountName}
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-sm text-navy">
                <span>Total Liabilities</span>
                <span>₹{Number(totalLiabilities).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
            <CardHeader className="bg-[#F9FAFB] border-b border-border py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-navy">
                  3. Equity
                </CardTitle>
                <span className="text-sm font-bold text-navy">
                  ₹{Number(totalEquity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-2">
              {report.equity.accounts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No equity accounts found.
                </p>
              ) : (
                report.equity.accounts.map((acc) => (
                  <div
                    key={acc.accountId}
                    className="flex justify-between items-center py-2 text-xs border-b border-border/60 last:border-0"
                  >
                    <span className="text-foreground">
                      {acc.accountName}
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-sm text-navy">
                <span>Total Equity</span>
                <span>₹{Number(totalEquity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
