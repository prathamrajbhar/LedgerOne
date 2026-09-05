import * as React from "react";
import { generateProfitLossReportAction } from "@/app/actions/accounting.actions";
import { resolveAccountingPeriod } from "@/lib/constants/accounting-periods";
import { ProfitLossClient } from "./profit-loss-client";
import type { ProfitLossReport } from "@/lib/services/reports/profit-loss.service";

interface ProfitLossPageProps {
  searchParams?: {
    period?: string;
    from?: string;
    to?: string;
  };
}

export default async function ProfitLossPage({ searchParams }: ProfitLossPageProps) {
  const periodInfo = resolveAccountingPeriod(
    searchParams?.period,
    searchParams?.from,
    searchParams?.to
  );

  const result = await generateProfitLossReportAction({
    startDate: periodInfo.start,
    endDate: periodInfo.end,
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
