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
import { createAccountAction } from "@/app/actions/master-data.actions";
import { AccountType } from "@prisma/client";

export default function NewAccountPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AccountType>("EXPENSES");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Account code and name are required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAccountAction({
        code: code.trim(),
        name: name.trim(),
        type,
      });

      if (result.success) {
        toast.success(`General Ledger Account "${name}" created successfully.`);
        router.push("/accounts");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create account");
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
          href="/accounts"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Chart of Accounts
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              New General Ledger Account
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Add an account to the company double-entry chart of accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/accounts")}
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
              Save Account
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
          Account Particulars
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Account Code"
            required
            placeholder="e.g. 1030, 4010"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <FormInput
            label="Account Name"
            required
            placeholder="e.g. Axis Bank Current A/c, Production Electricity"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormSelect
            label="Classification Type"
            value={type}
            onValueChange={(val) => setType(val as AccountType)}
            options={[
              { value: "BANK", label: "Bank Account (Liquid Asset)" },
              { value: "CASH", label: "Cash Account" },
              { value: "ASSET", label: "Current Asset / Inventory" },
              { value: "LIABILITY", label: "Liability / Trade Payable" },
              { value: "CAPITAL", label: "Equity / Capital" },
              { value: "INCOME", label: "Income / Sales Revenue" },
              { value: "EXPENSES", label: "Direct Expense (COGS)" },
              { value: "OTHER_EXPENSES", label: "Administrative / Other Expense" },
            ]}
          />
        </form>
      </Card>
    </div>
  );
}
