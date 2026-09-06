"use client";

import * as React from "react";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { PurchaseOrderRow } from "./purchase-order-row";

export interface SerializedPurchaseOrder {
  id: string;
  poNumber: string;
  vendor?: { name: string } | null;
  orderDate: string;
  status: string;
  total: number;
  _count?: { lines: number };
  lines?: unknown[];
}

interface PurchaseOrdersTableProps {
  purchaseOrders: SerializedPurchaseOrder[];
}

export function PurchaseOrdersTable({ purchaseOrders }: PurchaseOrdersTableProps) {
  const [search, setSearch] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    if (!search.trim()) return purchaseOrders;
    const q = search.toLowerCase().trim();
    return purchaseOrders.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(q) ||
        (po.vendor?.name && po.vendor.name.toLowerCase().includes(q))
    );
  }, [purchaseOrders, search]);

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
      <div className="flex items-center gap-3">
        <div className="max-w-sm w-full">
          <DebouncedSearchInput
            placeholder="Search purchase orders by PO # or vendor..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {sortedItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {search ? "No purchase orders found matching your search" : "No purchase orders recorded yet"}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
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
        )}
      </div>
    </div>
  );
}
