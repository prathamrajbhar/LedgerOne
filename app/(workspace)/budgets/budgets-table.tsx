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
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Budget Name</th>
              <th className="py-3.5 px-4">Period</th>
              <th className="py-3.5 px-4">Responsible</th>
              <th className="py-3.5 px-4 text-right">Committed</th>
              <th className="py-3.5 px-4 text-right">Achieved</th>
              <th className="py-3.5 px-4 text-center">Achievement</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {budgets.map((budget) => {
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
    </div>
  );
}
