"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Plus, Trash2, ArrowLeft, Loader2, PiggyBank, Calendar, BarChart3, Save } from "lucide-react";
import { createBudgetAction } from "@/app/actions/budget.actions";
import { toast } from "sonner";
import Link from "next/link";
import { AnalyticAccountType } from "@prisma/client";

interface OptionUser {
  id: string;
  name: string | null;
  email: string;
}

interface OptionAnalytic {
  id: string;
  name: string;
  type: AnalyticAccountType;
}

interface LineItem {
  analyticAccountId: string;
  type: AnalyticAccountType;
  committedAmount: string;
}

interface BudgetFormProps {
  users: OptionUser[];
  analytics: OptionAnalytic[];
}

export function BudgetForm({ users, analytics }: BudgetFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [startDate, setStartDate] = React.useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = React.useState(
    new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0]
  );
  const [responsibleId, setResponsibleId] = React.useState(users[0]?.id || "");

  const [lines, setLines] = React.useState<LineItem[]>([
    {
      analyticAccountId: analytics[0]?.id || "",
      type: analytics[0]?.type || "EXPENSES",
      committedAmount: "",
    },
  ]);

  const userOptions = React.useMemo(() => {
    return users.map((u) => ({
      value: u.id,
      label: u.name || u.email,
      subLabel: u.name ? u.email : undefined,
    }));
  }, [users]);

  const analyticOptions = React.useMemo(() => {
    return analytics.map((a) => ({
      value: a.id,
      label: `${a.name} (${a.type})`,
      subLabel: `Allocation Type: ${a.type}`,
    }));
  }, [analytics]);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        analyticAccountId: analytics[0]?.id || "",
        type: analytics[0]?.type || "EXPENSES",
        committedAmount: "",
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      toast.error("Budget must contain at least one analytic line");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof LineItem, value: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "analyticAccountId") {
        const found = analytics.find((a) => a.id === value);
        if (found) updated[index].type = found.type;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Budget name is required");
    if (!responsibleId) return toast.error("Responsible user is required");
    if (new Date(endDate) <= new Date(startDate)) return toast.error("End date must be after start date");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.analyticAccountId) return toast.error(`Line ${i + 1}: Analytic account is required`);
      const amt = parseFloat(line.committedAmount);
      if (isNaN(amt) || amt <= 0) return toast.error(`Line ${i + 1}: Enter a valid amount greater than 0`);
    }

    setSubmitting(true);
    try {
      const result = await createBudgetAction({
        name: name.trim(),
        startDate,
        endDate,
        responsibleId,
        lines: lines.map((l) => ({
          analyticAccountId: l.analyticAccountId,
          type: l.type,
          committedAmount: parseFloat(l.committedAmount),
        })),
      });

      if (result.success && result.data) {
        toast.success("Budget created successfully in DRAFT status");
        router.push(`/budgets/${result.data.id}`);
        return;
      }
      toast.error(result.error || "Failed to create budget");
    } catch {
      toast.error("An error occurred while saving the budget");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCommitted = lines.reduce((sum, l) => sum + (parseFloat(l.committedAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/budgets">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Budgets
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground bg-white/80 px-2.5 py-1 rounded-full border border-border">
          New Budget Allocation
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EBF3F9] text-navy flex items-center justify-center flex-shrink-0 border border-navy/10">
            <PiggyBank className="h-6 w-6 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
                Create New Budget
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E3F3F3] text-[#167C80]">
                Financial Planning
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Define target committed amounts for your revenue and expense analytic accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <Link href="/budgets">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            size="sm"
            className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Create Draft Budget
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Information */}
        <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-navy" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">General Information</h2>
              <p className="text-xs text-muted-foreground">Fiscal period, title, and responsible manager</p>
            </div>
          </div>
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Budget Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. FY 2024-25 Operating Budget"
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Responsible Person
              </label>
              <SearchableSelect
                value={responsibleId}
                onChange={(val) => setResponsibleId(val)}
                options={userOptions}
                placeholder="Select responsible person"
                searchPlaceholder="Search user by name or email..."
              />
            </div>
            <FormInput
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Budget Lines */}
        <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#E3F3F3] text-[#167C80] flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-[#167C80]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Budget Lines (Analytic Allocation)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Commit target figures per analytic account.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLine}
              className="text-xs gap-1.5 shadow-2xs hover:border-border-strong"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-end gap-3 p-3.5 bg-surface-subtle/60 rounded-xl border border-border/70 hover:border-border-strong transition-all"
              >
                <div className="w-full sm:flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Analytic Account #{idx + 1}
                  </label>
                  <SearchableSelect
                    value={line.analyticAccountId}
                    onChange={(val) => handleLineChange(idx, "analyticAccountId", val)}
                    options={analyticOptions}
                    placeholder="Select analytic account"
                    searchPlaceholder="Search analytic account..."
                  />
                </div>
                <div className="w-full sm:w-36">
                  <FormSelect
                    label="Type"
                    value={line.type}
                    onValueChange={(val) => handleLineChange(idx, "type", val as AnalyticAccountType)}
                    options={[
                      { value: "EXPENSES", label: "Expenses" },
                      { value: "INCOME", label: "Income" },
                    ]}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <FormInput
                    label="Committed (₹)"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={line.committedAmount}
                    onChange={(e) => handleLineChange(idx, "committedAmount", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLine(idx)}
                  className="text-muted-foreground hover:text-destructive h-10 px-2.5 hover:bg-destructive/10 rounded-lg"
                  aria-label="Remove line"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="pt-4 border-t border-border flex justify-between items-center text-sm px-1">
              <span className="font-semibold text-muted-foreground">Total Budget Committed:</span>
              <span className="font-bold font-mono text-lg text-navy">
                ₹{totalCommitted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Link href="/budgets">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            size="sm"
            className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Create Draft Budget
          </Button>
        </div>
      </form>
    </div>
  );
}
