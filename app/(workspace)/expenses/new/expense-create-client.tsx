"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiFileUploader } from "@/components/ai/ai-file-uploader";
import { parseExpenseReceiptAction } from "@/app/actions/ai-document.actions";
import { createManualJournalEntryAction } from "@/app/actions/accounting.actions";
import { ParsedExpenseResult } from "@/lib/services/ai-document-parser.service";
import type {
  ExpenseAccount,
  AnalyticAccountOption,
  JournalOption,
} from "@/app/actions/expense.actions";
import { ExpenseNewHeader } from "./components/expense-new-header";
import { ExpenseNewFields } from "./components/expense-new-fields";

interface ExpenseCreateClientProps {
  expenseAccounts: ExpenseAccount[];
  analyticAccounts: AnalyticAccountOption[];
  journals: JournalOption[];
}

export function ExpenseCreateClient({
  expenseAccounts,
  analyticAccounts,
  journals,
}: ExpenseCreateClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const [description, setDescription] = React.useState("");
  const [expenseAccountId, setExpenseAccountId] = React.useState(
    expenseAccounts[0]?.id || ""
  );
  const [analyticAccountId, setAnalyticAccountId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [journalId, setJournalId] = React.useState(journals[0]?.id || "");
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const handleAiParsedExpense = (raw: unknown) => {
    const data = raw as ParsedExpenseResult;
    if (!data) return;

    if (data.description) setDescription(data.description);
    if (data.amount && data.amount > 0) setAmount(String(data.amount));
    if (data.expenseDate) setExpenseDate(data.expenseDate);
    if (data.recommendedAccountId) setExpenseAccountId(data.recommendedAccountId);

    toast.success(`Expense details auto-filled: ₹${data.amount || 0}`);
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !expenseAccountId || !amount || !journalId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const selectedJournal = journals.find((j) => j.id === journalId);
    if (!selectedJournal || !selectedJournal.defaultAccountId) {
      toast.error("Selected journal does not have a default payment account mapped");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createManualJournalEntryAction({
        journalId,
        accountingDate: new Date(expenseDate),
        lines: [
          {
            accountId: expenseAccountId,
            debit: numAmount,
            credit: 0,
          },
          {
            accountId: selectedJournal.defaultAccountId,
            debit: 0,
            credit: numAmount,
          },
        ],
      });

      if (result.success && result.data) {
        toast.success(`Expense recorded! Entry ${result.data.entryNumber} posted.`);
        router.push("/expenses");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to record expense");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <ExpenseNewHeader
        submitting={submitting}
        onSave={handleRecordExpense}
        onCancel={() => router.push("/expenses")}
      />

      <div className="bg-white p-5 border border-border rounded-xl shadow-2xs">
        <AiFileUploader
          onParsedData={handleAiParsedExpense}
          parseAction={parseExpenseReceiptAction}
          label="Auto-Fill Expense with Receipt Scan"
          description="Upload an image or receipt PDF to extract date, total amount, category, and vendor particulars"
        />
      </div>

      <form onSubmit={handleRecordExpense}>
        <ExpenseNewFields
          description={description}
          onDescriptionChange={setDescription}
          expenseAccountId={expenseAccountId}
          onExpenseAccountIdChange={setExpenseAccountId}
          expenseAccounts={expenseAccounts}
          analyticAccountId={analyticAccountId}
          onAnalyticAccountIdChange={setAnalyticAccountId}
          analyticAccounts={analyticAccounts}
          amount={amount}
          onAmountChange={setAmount}
          journalId={journalId}
          onJournalIdChange={setJournalId}
          journals={journals}
          expenseDate={expenseDate}
          onExpenseDateChange={setExpenseDate}
        />
      </form>
    </div>
  );
}
