"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";
import {
  createJournalAction,
  getSelectableAccountsAction,
} from "@/app/actions/master-data.actions";
import { JournalType } from "@prisma/client";

interface AccountOption {
  id: string;
  code: string;
  name: string;
}

export default function NewJournalPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [accountsLoading, setAccountsLoading] = React.useState(true);
  const [accounts, setAccounts] = React.useState<AccountOption[]>([]);

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<JournalType>("SALES");
  const [defaultAccountId, setDefaultAccountId] = React.useState("");

  React.useEffect(() => {
    async function loadAccounts() {
      try {
        const result = await getSelectableAccountsAction();
        if (result.success && result.data) {
          setAccounts(result.data as AccountOption[]);
        }
      } catch {
        toast.error("Failed to load accounts list");
      } finally {
        setAccountsLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const accountOptions = React.useMemo(() => {
    return accounts.map((acc) => ({
      value: acc.id,
      label: `${acc.code} - ${acc.name}`,
      subLabel: `Account #${acc.code}`,
    }));
  }, [accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Journal code and name are required");
      return;
    }
    if (!defaultAccountId) {
      toast.error("Default offset account is required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createJournalAction({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        defaultAccountId,
      });

      if (result.success) {
        toast.success(`Journal "${name}" created successfully.`);
        router.push("/journals");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create journal");
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
          href="/journals"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Journals
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Configure Accounting Journal
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Create a dedicated posting book for sales invoices, vendor bills, bank accounts, or cash.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/journals")}
              disabled={submitting}
              className="h-9 text-xs px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || accountsLoading}
              className="h-9 text-xs px-4 bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Journal
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
          Journal Specifications
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Journal Code"
            required
            placeholder="e.g. INV, BILL, BNK1"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <FormInput
            label="Journal Name"
            required
            placeholder="e.g. Customer Invoices, Main HDFC Bank"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormSelect
            label="Journal Type"
            value={type}
            onValueChange={(val) => setType(val as JournalType)}
            options={[
              { value: "SALES", label: "Sales (Customer Invoices)" },
              { value: "PURCHASE", label: "Purchase (Vendor Bills)" },
              { value: "BANK", label: "Bank Account" },
              { value: "CASH", label: "Cash Book" },
            ]}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Default Offset Account <span className="text-destructive">*</span>
            </label>
            <SearchableSelect
              value={defaultAccountId}
              onChange={setDefaultAccountId}
              options={accountOptions}
              placeholder={accountsLoading ? "Loading accounts..." : "Select default GL account..."}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
