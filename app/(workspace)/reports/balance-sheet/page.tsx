import * as React from "react";
import { generateBalanceSheetAction } from "@/app/actions/accounting.actions";
import { resolveAccountingPeriod } from "@/lib/constants/accounting-periods";
import { BalanceSheetClient } from "./balance-sheet-client";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";

interface BalanceSheetPageProps {
  searchParams?: {
    period?: string;
    from?: string;
    to?: string;
  };
}

export default async function BalanceSheetPage({ searchParams }: BalanceSheetPageProps) {
  const periodInfo = resolveAccountingPeriod(
    searchParams?.period,
    searchParams?.from,
    searchParams?.to
  );

  const result = await generateBalanceSheetAction({
    asOfDate: periodInfo.end,
  });

  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-xs text-muted-foreground">
        Failed to load balance sheet. Please check your accounting entries.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <BalanceSheetClient initialReport={result.data as BalanceSheetReport} />
    </div>
  );
}
