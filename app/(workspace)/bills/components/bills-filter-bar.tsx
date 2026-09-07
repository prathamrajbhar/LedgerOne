"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import type { Contact } from "@prisma/client";

interface BillsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  vendorFilter: string;
  onVendorFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (val: string) => void;
  dateRangeFilter: { start: string; end: string };
  onDateRangeFilterChange: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  vendors: Contact[];
  totalRecords: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export function BillsFilterBar({
  search,
  onSearchChange,
  vendorFilter,
  onVendorFilterChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  dateRangeFilter,
  onDateRangeFilterChange,
  vendors,
  totalRecords,
  filteredCount,
  onResetFilters,
}: BillsFilterBarProps) {
  const isFiltered = Boolean(
    search ||
      vendorFilter !== "ALL" ||
      statusFilter !== "ALL" ||
      paymentStatusFilter !== "ALL" ||
      dateRangeFilter.start ||
      dateRangeFilter.end
  );

  return (
    <Card className="p-3 border-border shadow-2xs bg-white space-y-2.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[240px]">
          <DebouncedSearchInput
            placeholder="Search vendor/bill number (e.g. BILL00001, Timber Supplies)..."
            value={search}
            onChange={onSearchChange}
            className="h-8.5"
          />
        </div>

        {/* Filters cluster */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => onVendorFilterChange(e.target.value)}
            className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
          >
            <option value="ALL">Document Status</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => onPaymentStatusFilterChange(e.target.value)}
            className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
          >
            <option value="ALL">Payment Status</option>
            <option value="NOT_PAID">Not Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Paid in Full</option>
          </select>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) =>
                onDateRangeFilterChange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full h-8.5 px-1.5 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) =>
                onDateRangeFilterChange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full h-8.5 px-1.5 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters helper */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing {filteredCount} of {totalRecords} records
          </span>
          <button
            onClick={onResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </Card>
  );
}
