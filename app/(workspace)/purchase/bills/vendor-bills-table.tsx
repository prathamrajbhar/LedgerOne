"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "billNumber",
    header: "Bill Number",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.billNumber}
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
    accessorKey: "billDate",
    header: "Bill Date",
    cell: ({ row }) => new Date(row.original.billDate).toLocaleDateString(),
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
      <Link href={`/purchase/bills/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface VendorBillsTableProps {
  data: {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function VendorBillsTable({ data }: VendorBillsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      emptyMessage="No vendor bills recorded yet. Click 'New Vendor Bill' above to add one."
    />
  );
}
