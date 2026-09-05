"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "soNumber",
    header: "SO Number",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.soNumber}
      </span>
    ),
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <span className="text-gray-800">
        {row.original.customer?.name || "Unknown Customer"}
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
      <Link href={`/sales/orders/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface SalesOrdersTableProps {
  data: any[] | { data: any[] };
}

export function SalesOrdersTable({ data }: SalesOrdersTableProps) {
  const records = Array.isArray(data) ? data : data?.data || [];
  return (
    <DataTable
      columns={columns}
      data={records}
      emptyMessage="No sales orders created yet. Click 'New Sales Order' above to add one."
    />
  );
}
