import * as React from "react";
import { notFound } from "next/navigation";
import { getBudgetByIdAction } from "@/app/actions/budget.actions";
import { BudgetDetailClient, BudgetDetailData } from "./budget-detail-client";

export default async function BudgetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getBudgetByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <BudgetDetailClient budget={result.data as BudgetDetailData} />
    </div>
  );
}
