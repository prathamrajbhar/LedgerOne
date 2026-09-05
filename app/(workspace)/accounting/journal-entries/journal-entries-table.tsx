"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "entryNumber",
    header: "Entry Number",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.entryNumber}
      </span>
    ),
  },
  {
    accessorKey: "accountingDate",
    header: "Accounting Date",
    cell: ({ row }) => new Date(row.original.accountingDate).toLocaleDateString(),
  },
  {
    accessorKey: "journal.name",
    header: "Journal",
    cell: ({ row }) => (
      <span className="text-gray-800">
        {row.original.journal?.name || "General"}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
        {row.original.source}
      </span>
    ),
  },
  {
    accessorKey: "totalDebit",
    header: "Total Debit",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        ${Number(row.original.totalDebit).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "totalCredit",
    header: "Total Credit",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        ${Number(row.original.totalCredit).toFixed(2)}
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
      <Link href={`/accounting/journal-entries/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface JournalEntriesTableProps {
  data: any[] | { data: any[] };
}

export function JournalEntriesTable({ data }: JournalEntriesTableProps) {
  const records = Array.isArray(data) ? data : data?.data || [];
  return (
    <DataTable
      columns={columns}
      data={records}
      emptyMessage="No journal entries recorded. Create a manual entry or confirm bills/invoices to auto-generate."
    />
  );
}
