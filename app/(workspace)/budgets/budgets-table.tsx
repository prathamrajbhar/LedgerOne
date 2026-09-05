"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Budget Name",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => {
      const s = new Date(row.original.startDate).toLocaleDateString();
      const e = new Date(row.original.endDate).toLocaleDateString();
      return <span className="text-sm text-gray-700">{s} - {e}</span>;
    },
  },
  {
    accessorKey: "responsible.name",
    header: "Responsible",
    cell: ({ row }) => (
      <span className="text-gray-800">
        {row.original.responsible?.name || "Unassigned"}
      </span>
    ),
  },
  {
    id: "achievement",
    header: "Overall Achievement",
    cell: ({ row }) => {
      const lines = row.original.lines || [];
      const totalPlanned = lines.reduce(
        (sum: number, l: any) => sum + Number(l.committedAmount || 0),
        0
      );
      const totalAchieved = lines.reduce(
        (sum: number, l: any) => sum + Number(l.achievedAmount || 0),
        0
      );
      const pct = totalPlanned > 0 ? (totalAchieved / totalPlanned) * 100 : 0;

      return (
        <div className="w-36 space-y-1">
          <div className="flex justify-between text-xs font-medium text-gray-700">
            <span>{pct.toFixed(1)}%</span>
            <span className="text-muted-foreground">${totalAchieved.toFixed(0)} / ${totalPlanned.toFixed(0)}</span>
          </div>
          <Progress value={pct} max={100} className="h-1.5" />
        </div>
      );
    },
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
      <Link href={`/budgets/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
    ),
  },
];

interface BudgetsTableProps {
  data: any[];
}

export function BudgetsTable({ data }: BudgetsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data || []}
      emptyMessage="No budgets created yet. Click 'New Budget' above to establish financial targets."
    />
  );
}
