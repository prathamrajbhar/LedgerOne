"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import type {
  ExpenseAccount,
  AnalyticAccountOption,
  JournalOption,
} from "@/app/actions/expense.actions";

interface ExpenseNewFieldsProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  expenseAccountId: string;
  onExpenseAccountIdChange: (val: string) => void;
  expenseAccounts: ExpenseAccount[];
  analyticAccountId: string;
  onAnalyticAccountIdChange: (val: string) => void;
  analyticAccounts: AnalyticAccountOption[];
  amount: string;
  onAmountChange: (val: string) => void;
  journalId: string;
  onJournalIdChange: (val: string) => void;
  journals: JournalOption[];
  expenseDate: string;
  onExpenseDateChange: (val: string) => void;
}

export function ExpenseNewFields({
  description,
  onDescriptionChange,
  expenseAccountId,
  onExpenseAccountIdChange,
  expenseAccounts,
  analyticAccountId,
  onAnalyticAccountIdChange,
  analyticAccounts,
  amount,
  onAmountChange,
  journalId,
  onJournalIdChange,
  journals,
  expenseDate,
  onExpenseDateChange,
}: ExpenseNewFieldsProps) {
  const expenseAccountOptions = React.useMemo(() => {
    return expenseAccounts.map((acc) => ({
      value: acc.id,
      label: acc.name,
    }));
  }, [expenseAccounts]);

  const analyticAccountOptions = React.useMemo(() => {
    return [
      { value: "", label: "No Project / Cost Center" },
      ...analyticAccounts.map((acc) => ({
        value: acc.id,
        label: acc.name,
      })),
    ];
  }, [analyticAccounts]);

  const journalOptions = React.useMemo(() => {
    return journals.map((j) => ({
      value: j.id,
      label: `${j.name} (${j.type === "BANK" ? "Bank Transfer" : "Cash Ledger"})`,
    }));
  }, [journals]);

  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
        Expense Particulars & Payment Account
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Expense Description / Purpose"
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g., Office Electricity Bill, Workshop Utilities"
        />

        <FormInput
          label="Expense Amount (₹)"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
        />

        <FormSelect
          label="Expense Category / Account"
          required
          options={expenseAccountOptions}
          value={expenseAccountId}
          onValueChange={onExpenseAccountIdChange}
        />

        <FormSelect
          label="Cost Center / Project (Analytic)"
          options={analyticAccountOptions}
          value={analyticAccountId}
          onValueChange={onAnalyticAccountIdChange}
        />

        <FormSelect
          label="Paid From (Payment Journal)"
          required
          options={journalOptions}
          value={journalId}
          onValueChange={onJournalIdChange}
        />

        <FormInput
          label="Expense Date"
          type="date"
          required
          value={expenseDate}
          onChange={(e) => onExpenseDateChange(e.target.value)}
        />
      </div>
    </Card>
  );
}
