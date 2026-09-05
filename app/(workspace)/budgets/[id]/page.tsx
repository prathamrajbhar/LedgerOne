import { budgetService } from "@/lib/services/budget.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, History, GitFork } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function BudgetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let budget;
  try {
    budget = await budgetService.findById(params.id);
  } catch {
    notFound();
  }

  async function confirmBudget() {
    "use server";
    await budgetService.confirm(params.id);
    revalidatePath(`/budgets/${params.id}`);
    revalidatePath("/budgets");
  }

  async function reviseBudget() {
    "use server";
    await budgetService.revise({
      budgetId: params.id,
      lines: budget!.lines.map((l: any) => ({
        analyticAccountId: l.analyticAccountId,
        type: l.type,
        committedAmount: l.committedAmount,
      })),
      userId: budget!.responsibleId,
    });
    revalidatePath(`/budgets/${params.id}`);
    revalidatePath("/budgets");
  }

  const totalCommitted = budget.lines.reduce(
    (sum: number, l: any) => sum + Number(l.committedAmount || 0),
    0
  );
  const totalAchieved = budget.lines.reduce(
    (sum: number, l: any) => sum + Number(l.achievedAmount || 0),
    0
  );
  const overallPct =
    totalCommitted > 0 ? (totalAchieved / totalCommitted) * 100 : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Budget: ${budget.name}`}
        description={`Period: ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/budgets">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Budgets
              </Button>
            </Link>
            {budget.status === "DRAFT" && (
              <form action={confirmBudget}>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4" /> Confirm Budget
                </Button>
              </form>
            )}
            {budget.status === "CONFIRMED" && (
              <form action={reviseBudget}>
                <Button size="sm" variant="outline" className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50">
                  <GitFork className="h-4 w-4" /> Create Revision
                </Button>
              </form>
            )}
          </div>
        }
      />

      {budget.revisionOf && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>
            This budget is a revision of{" "}
            <Link href={`/budgets/${budget.revisionOf.id}`} className="font-semibold underline">
              {budget.revisionOf.name}
            </Link>
          </span>
        </div>
      )}

      {/* Overall Progress Banner */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Overall Budget Achievement</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-0.5">
                {overallPct.toFixed(1)}%
              </h2>
            </div>
            <div className="text-sm sm:text-right">
              <p className="text-muted-foreground">Committed: ${totalCommitted.toFixed(2)}</p>
              <p className="font-semibold text-gray-900">
                Achieved: ${totalAchieved.toFixed(2)}
              </p>
            </div>
          </div>
          <Progress value={overallPct} max={100} className="h-2.5" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Analytic Account Lines & Achievement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Analytic Account</th>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Type</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Planned</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Achieved</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budget.lines.map((line: any) => {
                    const pct = Number(line.achievedPercent || 0);
                    return (
                      <tr key={line.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {line.analyticAccount.name}
                        </td>
                        <td className="py-2.5 px-4 text-xs">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {line.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700">
                          ${Number(line.committedAmount).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-gray-900">
                          ${Number(line.achievedAmount).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`font-semibold ${pct > 100 ? "text-amber-600" : "text-emerald-600"}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={budget.status} />
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Responsible:</span>
                <span className="font-medium text-gray-900">{budget.responsible?.name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="text-gray-900">{new Date(budget.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">End Date:</span>
                <span className="text-gray-900">{new Date(budget.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Created At:</span>
                <span className="text-gray-900">{new Date(budget.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
