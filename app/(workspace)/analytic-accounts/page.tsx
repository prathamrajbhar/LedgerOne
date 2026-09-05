"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  getAnalyticAccountsAction,
  createAnalyticAccountAction,
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
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AnalyticAccountType>("EXPENSES");

  // Fetch analytic accounts on mount
  React.useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const result = await getAnalyticAccountsAction();
      if (result.success && result.data) {
        setAccounts(result.data);
      } else {
        toast.error(result.error || "Failed to load analytic accounts");
      }
    } catch (error) {
      toast.error("Failed to load analytic accounts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const result = await createAnalyticAccountAction({
        name,
        type,
      });

      if (result.success) {
        toast.success(`Analytic Account "${name}" created.`);
        setOpenModal(false);
        setName("");
        setType("EXPENSES");
        await loadAccounts();
      } else {
        toast.error(result.error || "Failed to create analytic account");
      }
    } catch (error) {
      toast.error("Failed to create analytic account");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

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
    } catch (error) {
      toast.error("Failed to delete analytic account");
      console.error(error);
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
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Analytic Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Cost Center / Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <FormInput
                  label="Project / Cost Center Name"
                  required
                  placeholder="e.g. Grand Hyatt Bedroom Suites Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
                <FormSelect
                  label="Account Type"
                  value={type}
                  onValueChange={(val) => setType(val as AnalyticAccountType)}
                  options={[
                    { value: "EXPENSES", label: "Cost/Expense Tracking" },
                    { value: "INCOME", label: "Income Tracking" },
                  ]}
                  disabled={submitting}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
            Click "New Analytic Account" to add your first cost center or project tracker.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse text-xs">
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
      )}
    </div>
  );
}
