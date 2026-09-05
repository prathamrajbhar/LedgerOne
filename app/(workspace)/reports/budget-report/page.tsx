import * as React from "react";
import { getBudgetsAction, getBudgetByIdAction } from "@/app/actions/budget.actions";
import { BudgetReportClient } from "./budget-report-client";
import type { BudgetDetailData } from "../../budgets/[id]/budget-detail-client";

export default async function BudgetReportPage() {
  const listResult = await getBudgetsAction();
  const summaryBudgets = (listResult.success && listResult.data ? listResult.data : []) as Array<{ id: string }>;

  const detailedBudgets: BudgetDetailData[] = [];

  for (const item of summaryBudgets) {
    const detailResult = await getBudgetByIdAction(item.id);
    if (detailResult.success && detailResult.data) {
      detailedBudgets.push(detailResult.data as BudgetDetailData);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <BudgetReportClient budgets={detailedBudgets} />
    </div>
  );
}
