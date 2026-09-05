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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <BudgetForm users={users} analytics={analytics} />
    </div>
  );
}
