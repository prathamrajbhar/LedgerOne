import * as React from "react";
import { generateProfitLossReportAction } from "@/app/actions/accounting.actions";
import { ProfitLossClient } from "./profit-loss-client";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";

export default async function ProfitLossPage() {
  const now = new Date();
  const fiscalYearStart = new Date(now.getFullYear(), 0, 1);

  const result = await generateProfitLossReportAction({
    startDate: fiscalYearStart,
    endDate: now,
  });

  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-xs text-muted-foreground">
        Failed to load profit and loss report. Please check your accounting entries.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ProfitLossClient initialReport={result.data as ProfitLossReport} />
    </div>
  );
}
