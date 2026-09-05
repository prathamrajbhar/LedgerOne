import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, PiggyBank, ArrowUpRight } from "lucide-react";
import { getBudgetsAction } from "@/app/actions/budget.actions";
import { BudgetsTable, BudgetItem } from "./budgets-table";

export default async function BudgetsPage() {
  const result = await getBudgetsAction();
  const budgets: BudgetItem[] = (result.success && result.data ? result.data : []) as BudgetItem[];

  const totalCommitted = budgets.reduce((sum, b) => sum + b.totalCommitted, 0);
  const totalAchieved = budgets.reduce((sum, b) => sum + b.totalAchieved, 0);
  const overallRate = totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets & Planning"
        description="Plan expenditures, configure analytic accounts, and track budget achievement in real time."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/reports/budget-report">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Performance Report
              </Button>
            </Link>
            <Link href="/budgets/new">
              <Button size="sm" className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New Budget
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Total Committed
          </span>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            ₹{totalCommitted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all active budgets</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Total Achieved (Actual)
          </span>
          <div className="text-xl font-bold font-mono text-navy mt-1">
            ₹{totalAchieved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Direct from invoices & bills</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-white shadow-card">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Overall Achievement
          </span>
          <div className="text-xl font-bold font-mono text-teal mt-1">{overallRate}%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Weighted performance</p>
        </div>
      </div>

      {/* Budget Table or Empty State */}
      {budgets.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-primary-light text-navy flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No Budgets Created</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
            Create your first budget to set financial thresholds for your operational and marketing analytic accounts.
          </p>
          <Link href="/budgets/new">
            <Button size="sm" className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create First Budget
            </Button>
          </Link>
        </div>
      ) : (
        <BudgetsTable budgets={budgets} />
      )}
    </div>
  );
}
