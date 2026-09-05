"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
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
    accessorKey: "invoiceDate",
    header: "Date Issued",
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
      <span className="font-bold text-gray-900">
        ${Number(row.original.amountDue).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const isUnpaid = invoice.paymentStatus !== "PAID" && Number(invoice.amountDue) > 0;

      return (
        <div className="flex items-center gap-2">
          {isUnpaid ? (
            <Link href={`/invoices/${invoice.id}/pay`}>
              <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs">
                <CreditCard className="h-3.5 w-3.5" /> Pay Now
              </Button>
            </Link>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 px-2 py-1 bg-emerald-50 rounded">
              Settled
            </span>
          )}
        </div>
      );
    },
  },
];

interface PortalInvoicesTableProps {
  data: any[];
}

export function PortalInvoicesTable({ data }: PortalInvoicesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data || []}
      emptyMessage="You currently have no invoices on file."
    />
  );
}
