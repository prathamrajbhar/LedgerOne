"use client";

import * as React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Ban, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { confirmBudgetAction, cancelBudgetAction } from "@/app/actions/budget.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

export interface BudgetItem {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  responsible?: { name: string | null } | null;
  lineCount: number;
  totalCommitted: number;
  totalAchieved: number;
  achievementRate: number;
}

export function BudgetsTable({ budgets }: { budgets: BudgetItem[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const filteredBudgets = React.useMemo(() => {
    if (!search.trim()) return budgets;
    const q = search.toLowerCase().trim();
    return budgets.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.responsible?.name && b.responsible.name.toLowerCase().includes(q))
    );
  }, [budgets, search]);

  const { sortedItems: sortedBudgets, sortState, handleSort } = useTableSort<
    BudgetItem,
    "name" | "period" | "responsible" | "totalCommitted" | "totalAchieved" | "achievementRate" | "status"
  >(
    filteredBudgets,
    "name",
    "asc",
    {
      period: (b) => new Date(b.startDate).getTime(),
      responsible: (b) => b.responsible?.name || "",
      totalCommitted: (b) => b.totalCommitted,
      totalAchieved: (b) => b.totalAchieved,
      achievementRate: (b) => b.achievementRate,
      status: (b) => b.status,
    }
  );

  const handleAction = async (
    budgetId: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) => {
    setProcessingId(budgetId);
    try {
      const result = await action(budgetId);
      if (result.success) {
        toast.success(successMessage);
        router.refresh();
        return;
      }
      toast.error(result.error || "Action failed");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const fmtCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="max-w-sm w-full">
          <DebouncedSearchInput
            placeholder="Search budgets by name or responsible..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {sortedBudgets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {search ? "No budgets found matching your search" : "No budgets recorded yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <SortableTableHead
                columnKey="name"
                currentSort={sortState}
                onSort={handleSort}
                className="py-3.5 px-4"
              >
                Budget Name
              </SortableTableHead>
              <SortableTableHead
                columnKey="period"
                currentSort={sortState}
                onSort={handleSort}
                className="py-3.5 px-4"
              >
                Period
              </SortableTableHead>
              <SortableTableHead
                columnKey="responsible"
                currentSort={sortState}
                onSort={handleSort}
                className="py-3.5 px-4"
              >
                Responsible
              </SortableTableHead>
              <SortableTableHead
                columnKey="totalCommitted"
                currentSort={sortState}
                onSort={handleSort}
                align="right"
                className="py-3.5 px-4"
              >
                Committed
              </SortableTableHead>
              <SortableTableHead
                columnKey="totalAchieved"
                currentSort={sortState}
                onSort={handleSort}
                align="right"
                className="py-3.5 px-4"
              >
                Achieved
              </SortableTableHead>
              <SortableTableHead
                columnKey="achievementRate"
                currentSort={sortState}
                onSort={handleSort}
                align="center"
                className="py-3.5 px-4"
              >
                Achievement
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
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedBudgets.map((budget) => {
              const rate = Math.min(Math.max(budget.achievementRate, 0), 100);
              const isProcessing = processingId === budget.id;

              return (
                <tr key={budget.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link href={`/budgets/${budget.id}`} className="font-semibold text-navy hover:underline">
                      {budget.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">{budget.lineCount} analytic lines</div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {fmtDate(budget.startDate)} – {fmtDate(budget.endDate)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{budget.responsible?.name || "Unassigned"}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium">{fmtCurrency(budget.totalCommitted)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-navy">{fmtCurrency(budget.totalAchieved)}</td>
                  <td className="py-3.5 px-4 text-center min-w-[130px]">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${rate > 90 ? "bg-amber-500" : rate > 50 ? "bg-teal" : "bg-navy"}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">{budget.achievementRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={budget.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/budgets/${budget.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isProcessing}>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {budget.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={() => handleAction(budget.id, confirmBudgetAction, "Budget confirmed")}
                              className="text-xs cursor-pointer text-success"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-2" /> Confirm
                            </DropdownMenuItem>
                          )}
                          {(budget.status === "DRAFT" || budget.status === "CONFIRMED") && (
                            <DropdownMenuItem
                              onClick={() => handleAction(budget.id, cancelBudgetAction, "Budget cancelled")}
                              className="text-xs cursor-pointer text-destructive"
                            >
                              <Ban className="h-3.5 w-3.5 mr-2" /> Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        )}
      </div>
    </div>
  );
}
