"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  getExpensesAction,
  ExpenseRecord,
} from "@/app/actions/expense.actions";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { JournalEntryDetailDialog } from "../journal-entries/components/journal-entry-detail-dialog";

export default function ExpensesPage() {
  const router = useRouter();
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [accountFilter, setAccountFilter] = React.useState<string>("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
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

  // Extract unique expense accounts for dropdown
  const uniqueAccounts = React.useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.expenseAccount && e.expenseAccount !== "N/A") {
        set.add(e.expenseAccount);
      }
    });
    return Array.from(set).sort();
  }, [expenses]);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.code.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.expenseAccount.toLowerCase().includes(q) ||
        (e.analyticAccount && e.analyticAccount.toLowerCase().includes(q));

      const matchesAccount =
        accountFilter === "ALL" || e.expenseAccount === accountFilter;

      const matchesMethod =
        methodFilter === "ALL" ||
        e.paymentMethod.toUpperCase() === methodFilter.toUpperCase();

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(e.date) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(e.date) <= new Date(endDate);
      }

      return matchesSearch && matchesAccount && matchesMethod && matchesDate;
    });
  }, [expenses, search, accountFilter, methodFilter, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search ||
      accountFilter !== "ALL" ||
      methodFilter !== "ALL" ||
      startDate ||
      endDate
  );

  const handleResetFilters = () => {
    setSearch("");
    setAccountFilter("ALL");
    setMethodFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  type ExpenseSortColumn = "code" | "description" | "expenseAccount" | "analyticAccount" | "date" | "paymentMethod" | "amount";
  const { sortedItems: sortedExpenses, sortState, handleSort } = useTableSort<ExpenseRecord, ExpenseSortColumn>(
    filteredExpenses,
    "date",
    "desc",
    {
      code: (e) => e.code,
      description: (e) => e.description,
      expenseAccount: (e) => e.expenseAccount,
      analyticAccount: (e) => e.analyticAccount || "",
      date: (e) => new Date(e.date),
      paymentMethod: (e) => e.paymentMethod,
      amount: (e) => Number(e.amount),
    }
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational & Material Expenses"
        description="Record production costs, raw timber supplies, workshop utilities, and staff logistics."
        actions={
          <Button
            onClick={() => router.push("/expenses/new")}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Record Expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Total Recorded Expenses</span>
          <p className="text-xl font-bold text-navy mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Across {expenses.length} transactions</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">This Month</span>
          <p className="text-xl font-bold text-navy mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Operating overheads</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Average Expense</span>
          <p className="text-xl font-bold text-teal mt-1">
            ₹{expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString("en-IN") : "0"}
          </p>
          <span className="text-[11px] text-teal block mt-0.5">Per transaction</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="flex-1 min-w-[220px]">
          <DebouncedSearchInput
            placeholder="Search expenses by entry #, description, or account..."
            value={search}
            onChange={setSearch}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Expense Accounts</option>
            {uniqueAccounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="BANK">Bank Transfer</option>
            <option value="CASH">Cash</option>
          </select>

          <div className="col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </span>
          <button
            onClick={handleResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading expenses...
          </div>
        ) : sortedExpenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {hasActiveFilters
              ? "No expenses found matching your filters"
              : "No expenses recorded yet. Click 'Record Expense' to add one."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <SortableTableHead columnKey="code" currentSort={sortState} onSort={handleSort}>
                    Entry #
                  </SortableTableHead>
                  <SortableTableHead columnKey="description" currentSort={sortState} onSort={handleSort}>
                    Description
                  </SortableTableHead>
                  <SortableTableHead columnKey="expenseAccount" currentSort={sortState} onSort={handleSort}>
                    Expense Account
                  </SortableTableHead>
                  <SortableTableHead columnKey="analyticAccount" currentSort={sortState} onSort={handleSort}>
                    Analytic
                  </SortableTableHead>
                  <SortableTableHead columnKey="date" currentSort={sortState} onSort={handleSort}>
                    Date
                  </SortableTableHead>
                  <SortableTableHead columnKey="paymentMethod" currentSort={sortState} onSort={handleSort}>
                    Method
                  </SortableTableHead>
                  <SortableTableHead columnKey="amount" currentSort={sortState} onSort={handleSort} align="right">
                    Amount (₹)
                  </SortableTableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedExpenses.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEntryId(e.id)}
                    className="hover:bg-primary-light/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      <span className="hover:underline">{e.code}</span>
                    </td>
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
          </div>
        )}
      </div>

      <JournalEntryDetailDialog
        entryId={selectedEntryId}
        open={Boolean(selectedEntryId)}
        onOpenChange={(open) => {
          if (!open) setSelectedEntryId(null);
        }}
      />
    </div>
  );
}
