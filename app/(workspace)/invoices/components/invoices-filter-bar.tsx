"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import type { Contact } from "@prisma/client";

interface InvoicesFilterBarProps {
  search: string;
  customerFilter: string;
  statusFilter: string;
  paymentStatusFilter: string;
  startDate: string;
  endDate: string;
  customers: Contact[];
  totalRecords: number;
  onUpdateFilters: (updates: Record<string, string>) => void;
  onClearFilters: () => void;
}

export function InvoicesFilterBar({
  search,
  customerFilter,
  statusFilter,
  paymentStatusFilter,
  startDate,
  endDate,
  customers,
  totalRecords,
  onUpdateFilters,
  onClearFilters,
}: InvoicesFilterBarProps) {
  const hasActiveFilters = Boolean(
    search ||
      customerFilter !== "ALL" ||
      statusFilter !== "ALL" ||
      paymentStatusFilter !== "ALL" ||
      startDate ||
      endDate
  );

  return (
    <Card className="p-3 border-border shadow-2xs bg-white space-y-2.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <DebouncedSearchInput
            placeholder="Search invoice/customer..."
            value={search}
            onChange={(val) => onUpdateFilters({ search: val })}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={customerFilter}
            onChange={(e) => onUpdateFilters({ customer: e.target.value })}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onUpdateFilters({ status: e.target.value })}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">Document Status</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => onUpdateFilters({ paymentStatus: e.target.value })}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">Payment Status</option>
            <option value="NOT_PAID">Not Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Paid in Full</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onUpdateFilters({ startDate: e.target.value })}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onUpdateFilters({ endDate: e.target.value })}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing {totalRecords} record{totalRecords !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onClearFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </Card>
  );
}
