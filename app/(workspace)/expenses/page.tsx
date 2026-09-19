"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getExpensesAction,
  ExpenseRecord,
} from "@/app/actions/expense.actions";
import { useTableSort } from "@/components/ui/sortable-table-head";
import { ExpensesTable } from "./components/expenses-table";
import { ExpensesKpiStrip } from "./components/expenses-kpi-strip";
import { ExpensesFilterBar } from "./components/expenses-filter-bar";

export default function ExpensesPage() {
  const router = useRouter();
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

      <ExpensesKpiStrip totalExpenses={totalExpenses} count={expenses.length} />

      <ExpensesFilterBar
        search={search}
        onSearchChange={setSearch}
        accountFilter={accountFilter}
        onAccountChange={setAccountFilter}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        uniqueAccounts={uniqueAccounts}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredExpenses.length}
        totalCount={expenses.length}
        onResetFilters={handleResetFilters}
      />

      <ExpensesTable
        loading={loading}
        expenses={sortedExpenses}
        hasActiveFilters={hasActiveFilters}
        sortState={sortState}
        onSort={handleSort}
      />
    </div>
  );
}
