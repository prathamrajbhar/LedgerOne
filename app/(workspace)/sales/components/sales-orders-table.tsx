"use client";

import * as React from "react";
import { SortableTableHead, type SortState } from "@/components/ui/sortable-table-head";
import { SalesOrderRow } from "./sales-order-row";

export interface SalesOrderItem {
  id: string;
  soNumber: string;
  customerId?: string;
  customer?: { id?: string; name: string } | null;
  orderDate: string | Date;
  status: string;
  total: unknown;
  lines?: unknown[];
  invoices?: Array<{ id: string; invoiceNumber: string; status: string }>;
}

interface SalesOrdersTableProps {
  orders: SalesOrderItem[];
  hasActiveFilters: boolean;
  sortState: SortState<string>;
  onSort: (columnKey: string) => void;
  actionLoading: string | null;
  onConfirmOrder: (id: string) => void;
  onCreateInvoice: (id: string) => void;
}

export function SalesOrdersTable({
  orders,
  hasActiveFilters,
  sortState,
  onSort,
  actionLoading,
  onConfirmOrder,
  onCreateInvoice,
}: SalesOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-muted-foreground text-sm shadow-card">
        {hasActiveFilters
          ? "No sales orders found matching your filters"
          : "No sales orders recorded yet"}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
              <SortableTableHead
                columnKey="soNumber"
                currentSort={sortState}
                onSort={onSort}
                className="py-3.5 px-4"
              >
                Order #
              </SortableTableHead>
              <SortableTableHead
                columnKey="customer"
                currentSort={sortState}
                onSort={onSort}
                className="py-3.5 px-4"
              >
                Customer
              </SortableTableHead>
              <SortableTableHead
                columnKey="orderDate"
                currentSort={sortState}
                onSort={onSort}
                className="py-3.5 px-4"
              >
                Order Date
              </SortableTableHead>
              <SortableTableHead
                columnKey="items"
                currentSort={sortState}
                onSort={onSort}
                align="center"
                className="py-3.5 px-4"
              >
                Items
              </SortableTableHead>
              <SortableTableHead
                columnKey="total"
                currentSort={sortState}
                onSort={onSort}
                align="right"
                className="py-3.5 px-4"
              >
                Order Total
              </SortableTableHead>
              <SortableTableHead
                columnKey="status"
                currentSort={sortState}
                onSort={onSort}
                align="center"
                className="py-3.5 px-4"
              >
                Status
              </SortableTableHead>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((so) => (
              <SalesOrderRow
                key={so.id}
                order={so}
                actionLoading={actionLoading}
                onConfirmOrder={onConfirmOrder}
                onCreateInvoice={onCreateInvoice}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
