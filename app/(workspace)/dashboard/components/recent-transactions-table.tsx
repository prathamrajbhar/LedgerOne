"use client";

import * as React from "react";
import Link from "next/link";
import { Download, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import type { RecentTransaction } from "@/app/actions/dashboard.actions";

interface RecentTransactionsTableProps {
  recentTransactions: RecentTransaction[];
  onExport: () => void;
}

export function RecentTransactionsTable({
  recentTransactions,
  onExport,
}: RecentTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("All Categories");
  const [filterStatus, setFilterStatus] = React.useState("All Statuses");

  const filteredTransactions = recentTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.party.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All Categories" || transaction.category === filterCategory;
    const matchesStatus =
      filterStatus === "All Statuses" ||
      (filterStatus === "Paid" &&
        (transaction.status === "PAID" ||
          transaction.status === "RECEIVED" ||
          transaction.status === "POSTED")) ||
      (filterStatus === "Pending" &&
        (transaction.status === "PENDING" ||
          transaction.status === "NOT_PAID" ||
          transaction.status === "PARTIAL" ||
          transaction.status === "OVERDUE"));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Card className="p-5 bg-white shadow-card">
      <div className="flex items-center justify-between pb-4">
        <CardTitle className="text-base font-bold text-foreground">
          Recent Transactions
        </CardTitle>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-teal hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="w-full sm:w-72">
          <DebouncedSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search transactions..."
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                <span>{filterCategory}</span>
                <span className="text-muted-foreground">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterCategory("All Categories")}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("Sales")}>
                Sales
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("Purchase")}>
                Purchase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("Payment")}>
                Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                <span>{filterStatus}</span>
                <span className="text-muted-foreground">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus("All Statuses")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("Paid")}>
                Paid / Received
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("Pending")}>
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={onExport}
            size="sm"
            className="h-9 px-3.5 bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 ml-auto sm:ml-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No transactions match your search filters.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-primary-light/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-foreground mr-2.5">
                      {row.code}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {row.party}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    {row.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/transactions">View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Transaction ${row.code} details viewed.`)
                          }
                        >
                          Download Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
