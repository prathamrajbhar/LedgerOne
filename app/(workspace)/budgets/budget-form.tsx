"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="rounded-xl border border-border bg-white p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-foreground">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Budget Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FY 2024-25 Operating Budget" />
          <FormSelect label="Responsible Person" value={responsibleId} onValueChange={(val) => setResponsibleId(val)} options={users.map((u) => ({ value: u.id, label: u.name || u.email }))} />
          <FormInput label="Start Date" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <FormInput label="End Date" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Budget Lines (Analytic Allocation)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Commit target figures per analytic account.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Line
          </Button>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 p-3 bg-muted/40 rounded-lg border border-border/70">
              <div className="w-full sm:flex-1">
                <FormSelect label={`Analytic Account #${idx + 1}`} value={line.analyticAccountId} onValueChange={(val) => handleLineChange(idx, "analyticAccountId", val)} options={analytics.map((a) => ({ value: a.id, label: `${a.name} (${a.type})` }))} />
              </div>
              <div className="w-full sm:w-36">
                <FormSelect label="Type" value={line.type} onValueChange={(val) => handleLineChange(idx, "type", val as AnalyticAccountType)} options={[{ value: "EXPENSES", label: "Expenses" }, { value: "INCOME", label: "Income" }]} />
              </div>
              <div className="w-full sm:w-44">
                <FormInput label="Committed (₹)" type="number" step="0.01" min="0" required placeholder="0.00" value={line.committedAmount} onChange={(e) => handleLineChange(idx, "committedAmount", e.target.value)} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLine(idx)} className="text-muted-foreground hover:text-destructive h-9 px-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
          <span className="font-semibold text-muted-foreground">Total Budget Committed:</span>
          <span className="font-bold font-mono text-base text-navy">₹{totalCommitted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link href="/budgets">
          <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={submitting} size="sm" className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5">
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create Draft Budget
        </Button>
      </div>
    </form>
  );
}
