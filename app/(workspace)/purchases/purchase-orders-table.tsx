"use client";

import * as React from "react";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { PurchaseOrderRow } from "./purchase-order-row";

export interface SerializedPurchaseOrder {
  id: string;
  poNumber: string;
  vendorId?: string;
  vendor?: { id?: string; name: string } | null;
  orderDate: string;
  status: string;
  total: number;
  _count?: { lines: number };
  lines?: unknown[];
}

interface PurchaseOrdersTableProps {
  purchaseOrders: SerializedPurchaseOrder[];
  vendors?: Array<{ id: string; name: string }>;
  initialSearch?: string;
  initialVendor?: string;
  initialStatus?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function PurchaseOrdersTable({
  purchaseOrders,
  vendors = [],
  initialSearch = "",
  initialVendor = "ALL",
  initialStatus = "ALL",
  initialStartDate = "",
  initialEndDate = "",
}: PurchaseOrdersTableProps) {
  const [search, setSearch] = React.useState(initialSearch);
  const [vendorFilter, setVendorFilter] = React.useState(initialVendor);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [startDate, setStartDate] = React.useState(initialStartDate);
  const [endDate, setEndDate] = React.useState(initialEndDate);

  const filteredOrders = React.useMemo(() => {
    return purchaseOrders.filter((po) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        po.poNumber.toLowerCase().includes(q) ||
        (po.vendor?.name && po.vendor.name.toLowerCase().includes(q));

      const matchesVendor =
        vendorFilter === "ALL" ||
        po.vendorId === vendorFilter ||
        po.vendor?.id === vendorFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        po.status.toUpperCase() === statusFilter.toUpperCase();

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(po.orderDate) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(po.orderDate) <= new Date(endDate);
      }

      return matchesSearch && matchesVendor && matchesStatus && matchesDate;
    });
  }, [purchaseOrders, search, vendorFilter, statusFilter, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search || vendorFilter !== "ALL" || statusFilter !== "ALL" || startDate || endDate
  );

  const handleResetFilters = () => {
    setSearch("");
    setVendorFilter("ALL");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const { sortedItems, sortState, handleSort } = useTableSort<
    SerializedPurchaseOrder,
    "poNumber" | "vendor" | "orderDate" | "lines" | "total" | "status"
  >(
    filteredOrders,
    "orderDate",
    "desc",
    {
      vendor: (po) => po.vendor?.name || "",
      orderDate: (po) => new Date(po.orderDate).getTime(),
      lines: (po) => po._count?.lines || po.lines?.length || 0,
      total: (po) => po.total,
      status: (po) => po.status,
    }
  );

  return (
    <div className="space-y-3">
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="flex-1 min-w-[220px]">
          <DebouncedSearchInput
            placeholder="Search PO # or vendor name..."
            value={search}
            onChange={setSearch}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
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
            Showing {filteredOrders.length} of {purchaseOrders.length} purchase orders
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
        {sortedItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {hasActiveFilters
              ? "No purchase orders found matching your filters"
              : "No purchase orders recorded yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                  <SortableTableHead
                    columnKey="poNumber"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    PO Number
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="vendor"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Vendor
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="orderDate"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Order Date
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="lines"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Line Items
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="total"
                    currentSort={sortState}
                    onSort={handleSort}
                    align="right"
                    className="py-3.5 px-4"
                  >
                    Total (₹)
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="status"
                    currentSort={sortState}
                    onSort={handleSort}
                    align="center"
                    className="py-3.5 px-4"
                  >
                    Status
                  </SortableTableHead>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedItems.map((po) => (
                  <PurchaseOrderRow key={po.id} po={po} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
