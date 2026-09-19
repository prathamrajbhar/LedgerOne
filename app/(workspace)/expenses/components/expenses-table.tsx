"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SortableTableHead, type SortState } from "@/components/ui/sortable-table-head";
import type { ExpenseRecord } from "@/app/actions/expense.actions";

export type ExpenseSortColumn =
  | "code"
  | "description"
  | "expenseAccount"
  | "analyticAccount"
  | "date"
  | "paymentMethod"
  | "amount";

interface ExpensesTableProps {
  loading: boolean;
  expenses: ExpenseRecord[];
  hasActiveFilters: boolean;
  sortState: SortState<ExpenseSortColumn>;
  onSort: (columnKey: ExpenseSortColumn) => void;
}

export function ExpensesTable({
  loading,
  expenses,
  hasActiveFilters,
  sortState,
  onSort,
}: ExpensesTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      {loading ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
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
                <SortableTableHead columnKey="code" currentSort={sortState} onSort={onSort}>
                  Entry #
                </SortableTableHead>
                <SortableTableHead columnKey="description" currentSort={sortState} onSort={onSort}>
                  Description
                </SortableTableHead>
                <SortableTableHead columnKey="expenseAccount" currentSort={sortState} onSort={onSort}>
                  Expense Account
                </SortableTableHead>
                <SortableTableHead columnKey="analyticAccount" currentSort={sortState} onSort={onSort}>
                  Analytic
                </SortableTableHead>
                <SortableTableHead columnKey="date" currentSort={sortState} onSort={onSort}>
                  Date
                </SortableTableHead>
                <SortableTableHead columnKey="paymentMethod" currentSort={sortState} onSort={onSort}>
                  Method
                </SortableTableHead>
                <SortableTableHead columnKey="amount" currentSort={sortState} onSort={onSort} align="right">
                  Amount (₹)
                </SortableTableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => router.push(`/journal-entries/${e.id}`)}
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
  );
}
