"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAnalyticAccountsAction,
  deleteAnalyticAccountAction,
} from "@/app/actions/analytic-account.actions";
import { AnalyticAccountType } from "@prisma/client";

interface AnalyticAccount {
  id: string;
  name: string;
  type: AnalyticAccountType;
}

export default function AnalyticAccountsPage() {
  const [accounts, setAccounts] = React.useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadAccounts = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAnalyticAccountsAction();
      if (result.success && result.data) {
        setAccounts(result.data as AnalyticAccount[]);
      } else {
        toast.error(result.error || "Failed to load analytic accounts");
      }
    } catch {
      toast.error("Failed to load analytic accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleDelete = async (id: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) return;

    try {
      const result = await deleteAnalyticAccountAction(id);
      if (result.success) {
        toast.success("Analytic account deleted successfully");
        await loadAccounts();
      } else {
        toast.error(result.error || "Failed to delete analytic account");
      }
    } catch {
      toast.error("Failed to delete analytic account");
    }
  };

  const typeLabel = (accountType: AnalyticAccountType) => {
    switch (accountType) {
      case "INCOME":
        return "Income Tracking";
      case "EXPENSES":
        return "Cost/Expense Tracking";
      default:
        return accountType;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytic Accounts (Cost Centers)"
        description="Track financial performance, timber costs, and profitability per furniture contract or client project."
        actions={
          <Link href="/analytic-accounts/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              New Analytic Account
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading analytic accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">No analytic accounts configured yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;New Analytic Account&quot; to add your first cost center or project tracker.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Project / Cost Center</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{acc.name}</td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {typeLabel(acc.type)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                        onClick={() => handleDelete(acc.id, acc.name)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
