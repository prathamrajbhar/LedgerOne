"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.invoiceNumber}
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
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => new Date(row.original.invoiceDate).toLocaleDateString(),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
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
    accessorKey: "amountDue",
    header: "Amount Due",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        ${Number(row.original.amountDue).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/sales/invoices/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface CustomerInvoicesTableProps {
  data: {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function CustomerInvoicesTable({ data }: CustomerInvoicesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      emptyMessage="No customer invoices generated yet. Click 'New Customer Invoice' above to issue one."
    />
  );
}
