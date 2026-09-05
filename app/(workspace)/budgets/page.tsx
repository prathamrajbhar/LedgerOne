import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { budgetService } from "@/lib/services/budget.service";
import { BudgetsTable } from "./budgets-table";

export const dynamic = "force-dynamic";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const budgets = await budgetService.list({
    status: searchParams.status as any,
    search: searchParams.search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Monitor departmental and analytic account budgets with automated achievement tracking."
        actions={
          <Link href="/budgets/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Budget
            </Button>
          </Link>
        }
      />
      <BudgetsTable data={budgets} />
    </div>
  );
}
