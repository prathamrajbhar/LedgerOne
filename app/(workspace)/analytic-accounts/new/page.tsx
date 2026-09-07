"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { createAnalyticAccountAction } from "@/app/actions/analytic-account.actions";
import { AnalyticAccountType } from "@prisma/client";

export default function NewAnalyticAccountPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AnalyticAccountType>("EXPENSES");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Cost center / Project name is required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAnalyticAccountAction({
        name: name.trim(),
        type,
      });

      if (result.success) {
        toast.success(`Analytic Account "${name}" created successfully.`);
        router.push("/analytic-accounts");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create analytic account");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="space-y-3">
        <Link
          href="/analytic-accounts"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Cost Centers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              New Cost Center / Project
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Create an analytic account to track project-level profitability and costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/analytic-accounts")}
              disabled={submitting}
              className="h-9 text-xs px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-9 text-xs px-4 bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Cost Center
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
          Cost Center Particulars
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Project / Cost Center Name"
            required
            placeholder="e.g. Grand Hyatt Bedroom Suites Project, Commercial Office Fitout"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormSelect
            label="Analytic Purpose"
            value={type}
            onValueChange={(val) => setType(val as AnalyticAccountType)}
            options={[
              { value: "EXPENSES", label: "Cost & Material Expense Tracking" },
              { value: "INCOME", label: "Project Revenue & Income Tracking" },
            ]}
          />
        </form>
      </Card>
    </div>
  );
}
