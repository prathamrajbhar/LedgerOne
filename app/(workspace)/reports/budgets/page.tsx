import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { budgetReportService } from "@/lib/services/reports/budget-report.service";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function BudgetReportPage() {
  const reportLines = await budgetReportService.generate();

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Budget Variance Report"
        description="Planned allocations versus actual financial transactions by analytic account."
      />

      <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
        <CardHeader className="bg-[#F9FAFB] border-b border-border py-4 px-6">
          <CardTitle className="text-sm font-semibold text-navy">Budget Performance by Analytic Account</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportLines.length === 0 ? (
            <p className="text-xs text-muted-foreground py-12 text-center">
              No budget lines available for reporting. Confirm budgets under Budgets section to generate telemetry.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F9FAFB] border-b border-border">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase tracking-wider">Budget Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase tracking-wider">Analytic Account</th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-right font-semibold text-muted-foreground uppercase tracking-wider">Planned (₹)</th>
                    <th className="py-3 px-4 text-right font-semibold text-muted-foreground uppercase tracking-wider">Actual (₹)</th>
                    <th className="py-3 px-4 text-center font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                    <th className="py-3 px-4 text-right font-semibold text-muted-foreground uppercase tracking-wider">Remaining (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {reportLines.map((line, idx) => {
                    const pct = Number(line.achievedPercent || 0);
                    const planned = Number(line.committedAmount || 0);
                    const actual = Number(line.achievedAmount || 0);
                    const remaining = Number(line.variance || 0);

                    return (
                      <tr key={`${line.budgetId}-${line.analyticAccountId}-${idx}`} className="hover:bg-primary-light/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-navy">{line.budgetName}</td>
                        <td className="py-3.5 px-4 text-foreground">{line.analyticAccountName}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">
                            {line.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-foreground">
                          ₹{planned.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-navy">
                          ₹{actual.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-24 mx-auto space-y-1">
                            <span className="text-[11px] text-muted-foreground block text-center font-medium">
                              {pct.toFixed(0)}%
                            </span>
                            <Progress value={actual} max={planned || 100} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-foreground">
                          ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
