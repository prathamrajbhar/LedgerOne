"use client";

import * as React from "react";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

interface ExpensesFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  accountFilter: string;
  onAccountChange: (value: string) => void;
  methodFilter: string;
  onMethodChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  uniqueAccounts: string[];
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

export function ExpensesFilterBar({
  search,
  onSearchChange,
  accountFilter,
  onAccountChange,
  methodFilter,
  onMethodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  uniqueAccounts,
  hasActiveFilters,
  filteredCount,
  totalCount,
  onResetFilters,
}: ExpensesFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="flex-1 min-w-[220px]">
          <DebouncedSearchInput
            placeholder="Search expenses by entry #, description, or account..."
            value={search}
            onChange={onSearchChange}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={accountFilter}
            onChange={(e) => onAccountChange(e.target.value)}
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
            onChange={(e) => onMethodChange(e.target.value)}
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
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing {filteredCount} of {totalCount} expenses
          </span>
          <button
            onClick={onResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
