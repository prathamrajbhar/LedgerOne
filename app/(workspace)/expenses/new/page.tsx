import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  getExpenseAccountsAction,
  getAnalyticAccountsAction,
  getBankCashJournalsAction,
  ExpenseAccount,
  AnalyticAccountOption,
  JournalOption,
} from "@/app/actions/expense.actions";
import { ExpenseCreateClient } from "./expense-create-client";

async function NewExpenseContent() {
  const [accountsResult, analyticsResult, journalsResult] = await Promise.all([
    getExpenseAccountsAction(),
    getAnalyticAccountsAction(),
    getBankCashJournalsAction(),
  ]);

  const expenseAccounts =
    accountsResult.success && accountsResult.data
      ? (accountsResult.data as ExpenseAccount[])
      : [];
  const analyticAccounts =
    analyticsResult.success && analyticsResult.data
      ? (analyticsResult.data as AnalyticAccountOption[])
      : [];
  const journals =
    journalsResult.success && journalsResult.data
      ? (journalsResult.data as JournalOption[])
      : [];

  return (
    <ExpenseCreateClient
      expenseAccounts={expenseAccounts}
      analyticAccounts={analyticAccounts}
      journals={journals}
    />
  );
}

export default function NewExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Expense Form...
          </p>
        </div>
      }
    >
      <NewExpenseContent />
    </Suspense>
  );
}
