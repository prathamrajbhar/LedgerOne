"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  getExpensesAction,
  ExpenseRecord,
} from "@/app/actions/expense.actions";
import { ExpenseModal } from "@/components/forms/expense-modal";

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Fetch expenses on mount
  React.useEffect(() => {
    loadExpenses();
  }, []);

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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational & Material Expenses"
        description="Record production costs, raw timber supplies, workshop utilities, and staff logistics."
        actions={
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Record Expense
          </Button>
        }
      />

      <ExpenseModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={loadExpenses}
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
