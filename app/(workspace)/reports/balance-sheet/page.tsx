import * as React from "react";
import { generateBalanceSheetAction } from "@/app/actions/accounting.actions";
import { BalanceSheetClient } from "./balance-sheet-client";
import type { BalanceSheetReport } from "@/lib/services/reports/balance-sheet.service";

export default async function BalanceSheetPage() {
  const result = await generateBalanceSheetAction({});

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
