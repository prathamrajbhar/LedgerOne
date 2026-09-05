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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Budget Performance by Analytic Account</CardTitle>
        </CardHeader>
        <CardContent>
          {reportLines.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No budget lines available for reporting. Confirm budgets under Budgets section to generate telemetry.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Budget Name</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Analytic Account</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Type</th>
                    <th className="py-3 px-4 text-right font-medium text-gray-700">Planned ($)</th>
                    <th className="py-3 px-4 text-right font-medium text-gray-700">Actual ($)</th>
                    <th className="py-3 px-4 text-center font-medium text-gray-700">Progress</th>
                    <th className="py-3 px-4 text-right font-medium text-gray-700">Remaining ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportLines.map((line) => {
                    const pct = Number(line.achievedPercent || 0);
                    return (
                      <tr key={line.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{line.budgetName}</td>
                        <td className="py-3 px-4 text-gray-800">{line.analyticAccountName}</td>
                        <td className="py-3 px-4 text-xs">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                            {line.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          ${Number(line.planned).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ${Number(line.actual).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-24 mx-auto space-y-1">
                            <span className="text-xs text-gray-600 block text-center font-medium">
                              {pct.toFixed(0)}%
                            </span>
                            <Progress value={pct} max={100} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          ${Number(line.variance).toFixed(2)}
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
