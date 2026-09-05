"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, CheckCircle, RefreshCw, Ban } from "lucide-react";
import { confirmBudgetAction, cancelBudgetAction } from "@/app/actions/budget.actions";
import { toast } from "sonner";

export interface BudgetDetailLine {
  id: string;
  analyticAccountId: string;
  analyticAccountName: string;
  type: string;
  committedAmount: number;
  achievedAmount: number;
  achievedPercent: number;
  amountToAchieve: number;
}

export interface BudgetDetailData {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  responsible?: { name: string | null; email: string } | null;
  revisionOfId?: string | null;
  lines: BudgetDetailLine[];
  totalCommitted: number;
  totalAchieved: number;
  overallRate: number;
}

export function BudgetDetailClient({ budget }: { budget: BudgetDetailData }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleAction = async (action: (id: string) => Promise<{ success: boolean; error?: string }>, msg: string) => {
    setLoading(true);
    try {
      const res = await action(budget.id);
      if (res.success) {
        toast.success(msg);
        router.refresh();
        return;
      }
      toast.error(res.error || "Action failed");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/budgets" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy mb-2">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Budgets
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-navy">{budget.name}</h1>
            <StatusBadge status={budget.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Period: {formatDate(budget.startDate)} – {formatDate(budget.endDate)} · Responsible: {budget.responsible?.name || budget.responsible?.email || "Unassigned"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {budget.status === "DRAFT" && (
            <Button size="sm" disabled={loading} onClick={() => handleAction(confirmBudgetAction, "Budget confirmed and achievement computed!")} className="text-xs bg-teal hover:bg-teal-dark text-white gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> Confirm Budget
            </Button>
          )}
          {budget.status === "CONFIRMED" && (
            <Button variant="outline" size="sm" disabled={loading} onClick={() => handleAction(confirmBudgetAction, "Achievement recalculated!")} className="text-xs gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Recalculate Actuals
            </Button>
          )}
          {(budget.status === "DRAFT" || budget.status === "CONFIRMED") && (
            <Button variant="ghost" size="sm" disabled={loading} onClick={() => handleAction(cancelBudgetAction, "Budget cancelled")} className="text-xs text-destructive hover:bg-destructive-light/20 gap-1.5">
              <Ban className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Committed Budget</span>
          <div className="text-lg font-bold font-mono text-foreground mt-1">{formatCurrency(budget.totalCommitted)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Achieved (Actuals)</span>
          <div className="text-lg font-bold font-mono text-navy mt-1">{formatCurrency(budget.totalAchieved)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Variance / Balance</span>
          <div className="text-lg font-bold font-mono text-foreground mt-1">{formatCurrency(budget.totalCommitted - budget.totalAchieved)}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Overall Achievement</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-teal">{budget.overallRate}%</span>
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-teal transition-all" style={{ width: `${Math.min(budget.overallRate, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <div className="px-5 py-4 border-b border-border bg-[#F9FAFB]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Analytic Account Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="py-3 px-4">Analytic Account</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Committed</th>
                <th className="py-3 px-4 text-right">Achieved</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4 text-center min-w-[150px]">Achievement %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {budget.lines.map((l) => (
                <tr key={l.id} className="hover:bg-primary-light/30">
                  <td className="py-3.5 px-4 font-semibold text-foreground">{l.analyticAccountName}</td>
                  <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{l.type}</span></td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium">{formatCurrency(l.committedAmount)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-navy">{formatCurrency(l.achievedAmount)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">{formatCurrency(l.amountToAchieve)}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-teal transition-all" style={{ width: `${Math.min(Math.max(l.achievedPercent, 0), 100)}%` }} />
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{l.achievedPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
