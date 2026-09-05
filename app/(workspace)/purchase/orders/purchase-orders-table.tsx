"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "poNumber",
    header: "PO Number",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.poNumber}
      </span>
    ),
  },
  {
    accessorKey: "vendor.name",
    header: "Vendor",
    cell: ({ row }) => (
      <span className="text-gray-800">
        {row.original.vendor?.name || "Unknown Vendor"}
      </span>
    ),
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        ${Number(row.original.total).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/purchase/orders/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface PurchaseOrdersTableProps {
  data: any[] | { data: any[] };
}

export function PurchaseOrdersTable({ data }: PurchaseOrdersTableProps) {
  const records = Array.isArray(data) ? data : data?.data || [];
  return (
    <DataTable
      columns={columns}
      data={records}
      emptyMessage="No purchase orders created yet. Click 'New Purchase Order' above to add one."
    />
  );
}
