import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getBudgetFormDataAction } from "@/app/actions/budget.actions";
import { BudgetForm } from "../budget-form";
import { redirect } from "next/navigation";

export default async function NewBudgetPage() {
  const result = await getBudgetFormDataAction();

  if (!result.success || !result.data) {
    redirect("/budgets");
  }

  const { users, analytics } = result.data as {
    users: Array<{ id: string; name: string | null; email: string }>;
    analytics: Array<{ id: string; name: string; type: "INCOME" | "EXPENSES" }>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create New Budget"
        description="Define target committed amounts for your revenue and expense analytic accounts."
      />
      <BudgetForm users={users} analytics={analytics} />
    </div>
  );
}
