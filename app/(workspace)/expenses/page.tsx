"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import {
  getExpensesAction,
  getExpenseAccountsAction,
  getAnalyticAccountsAction,
  getBankCashJournalsAction,
  ExpenseRecord,
  ExpenseAccount,
  AnalyticAccountOption,
  JournalOption,
} from "@/app/actions/expense.actions";
import { createManualJournalEntryAction } from "@/app/actions/accounting.actions";
import { AiFileUploader } from "@/components/ai/ai-file-uploader";
import { parseExpenseReceiptAction } from "@/app/actions/ai-document.actions";
import { ParsedExpenseResult } from "@/lib/services/ai-document-parser.service";

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const [expenseAccounts, setExpenseAccounts] = React.useState<ExpenseAccount[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = React.useState<AnalyticAccountOption[]>([]);
  const [journals, setJournals] = React.useState<JournalOption[]>([]);

  const [description, setDescription] = React.useState("");
  const [expenseAccountId, setExpenseAccountId] = React.useState("");
  const [analyticAccountId, setAnalyticAccountId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [journalId, setJournalId] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch expenses on mount
  React.useEffect(() => {
    loadExpenses();
  }, []);

  // Fetch dropdown data when modal opens
  React.useEffect(() => {
    if (openModal) {
      loadDropdownData();
    }
  }, [openModal]);

  const loadExpenses = async () => {
    setLoading(true);
    const result = await getExpensesAction();
    if (result.success && result.data) {
      setExpenses(result.data);
    } else {
      toast.error(result.error || "Failed to load expenses");
    }
    setLoading(false);
  };

  const loadDropdownData = async () => {
    const [accountsResult, analyticsResult, journalsResult] = await Promise.all([
      getExpenseAccountsAction(),
      getAnalyticAccountsAction(),
      getBankCashJournalsAction(),
    ]);

    if (accountsResult.success && accountsResult.data) {
      setExpenseAccounts(accountsResult.data);
      if (accountsResult.data.length > 0) {
        setExpenseAccountId(accountsResult.data[0].id);
      }
    }

    if (analyticsResult.success && analyticsResult.data) {
      setAnalyticAccounts(analyticsResult.data);
    }

    if (journalsResult.success && journalsResult.data) {
      setJournals(journalsResult.data);
      if (journalsResult.data.length > 0) {
        setJournalId(journalsResult.data[0].id);
      }
    }
  };

  const handleAiParsedExpense = (raw: unknown) => {
    const data = raw as ParsedExpenseResult;
    if (!data) return;

    if (data.description) {
      setDescription(data.description);
    }
    if (data.amount && data.amount > 0) {
      setAmount(String(data.amount));
    }
    if (data.expenseDate) {
      setExpenseDate(data.expenseDate);
    }
    if (data.recommendedAccountId) {
      setExpenseAccountId(data.recommendedAccountId);
    }

    toast.success(`Expense details auto-filled: ₹${data.amount || 0}`);
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !expenseAccountId || !amount || !journalId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const expenseAmount = Number(amount);
    if (expenseAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    const selectedJournal = journals.find((j) => j.id === journalId);
    if (!selectedJournal) {
      toast.error("Invalid journal selected");
      return;
    }

    setSubmitting(true);

    // Create manual journal entry: Debit Expense, Credit Bank/Cash
    const lines = [
      {
        accountId: expenseAccountId,
        partnerId: analyticAccountId || undefined,
        debit: expenseAmount,
        credit: 0,
      },
      {
        accountId: selectedJournal.defaultAccountId,
        partnerId: undefined,
        debit: 0,
        credit: expenseAmount,
      },
    ];

    const result = await createManualJournalEntryAction({
      journalId,
      accountingDate: new Date(expenseDate),
      lines,
    });

    if (result.success) {
      toast.success("Expense recorded successfully as journal entry");
      setOpenModal(false);
      setDescription("");
      setAmount("");
      setAnalyticAccountId("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      loadExpenses();
    } else {
      toast.error(result.error || "Failed to record expense");
    }
    setSubmitting(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational & Material Expenses"
        description="Record production costs, raw timber supplies, workshop utilities, and staff logistics."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Operational Expense</DialogTitle>
              </DialogHeader>

              {/* AI Receipt / Slip Auto-Fill */}
              <div className="pt-1">
                <AiFileUploader
                  onParsedData={handleAiParsedExpense}
                  parseAction={parseExpenseReceiptAction}
                  label="Scan Receipt with AI"
                  description="Drop petrol slip, utility bill, or vendor invoice to auto-extract amount & category"
                />
              </div>

              <form onSubmit={handleRecordExpense} className="space-y-4 pt-2">
                <FormInput
                  label="Expense Description"
                  required
                  placeholder="e.g. Sawmill Timber Cutting Services"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <FormSelect
                  label="Expense Account"
                  value={expenseAccountId}
                  onValueChange={setExpenseAccountId}
                  options={expenseAccounts.map((acc) => ({
                    value: acc.id,
                    label: acc.name,
                  }))}
                  placeholder={expenseAccounts.length === 0 ? "No expense accounts found" : "Select expense account"}
                  required
                />
                <FormInput
                  label="Amount (₹)"
                  type="number"
                  required
                  placeholder="12500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                />
                <FormSelect
                  label="Payment Method (Journal)"
                  value={journalId}
                  onValueChange={setJournalId}
                  options={journals.map((j) => ({
                    value: j.id,
                    label: `${j.name} (${j.defaultAccountName})`,
                  }))}
                  placeholder={journals.length === 0 ? "No payment journals found" : "Select payment method"}
                  required
                />
                <FormInput
                  label="Expense Date"
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
                <FormSelect
                  label="Analytic Account (Optional)"
                  value={analyticAccountId}
                  onValueChange={setAnalyticAccountId}
                  options={[
                    { value: "", label: "None" },
                    ...analyticAccounts.map((acc) => ({
                      value: acc.id,
                      label: `${acc.name} (${acc.type})`,
                    })),
                  ]}
                  placeholder="Select analytic account"
                />
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <p className="font-semibold mb-1">Journal Entry Preview:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Dr. {expenseAccounts.find((a) => a.id === expenseAccountId)?.name || "Expense Account"}</span>
                      <span className="font-mono">₹{amount || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cr. {journals.find((j) => j.id === journalId)?.defaultAccountName || "Bank/Cash Account"}</span>
                      <span className="font-mono">₹{amount || "0"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting || expenseAccounts.length === 0 || journals.length === 0}
                  >
                    {submitting ? "Recording..." : "Post Expense"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Total Expenses</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Recorded to Date</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Expense Entries</span>
          <p className="text-xl font-bold text-navy mt-1">{expenses.length}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Journal entries posted</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Average Expense</span>
          <p className="text-xl font-bold text-teal mt-1">
            ₹{expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString("en-IN") : "0"}
          </p>
          <span className="text-[11px] text-teal block mt-0.5">Per transaction</span>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No expenses recorded yet. Click &quot;Record Expense&quot; to add one.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Entry #</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Expense Account</th>
                <th className="py-3.5 px-4">Analytic</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{e.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{e.description}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{e.expenseAccount}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{e.analyticAccount || "-"}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{e.date}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{e.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{e.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
