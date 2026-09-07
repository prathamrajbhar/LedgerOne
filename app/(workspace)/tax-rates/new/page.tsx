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
import { createTaxRateAction } from "@/app/actions/tax-rate.actions";
import { TaxApplicability } from "@prisma/client";

export default function NewTaxRatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [percentage, setPercentage] = React.useState("");
  const [applicability, setApplicability] = React.useState<TaxApplicability>("BOTH");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tax label is required");
      return;
    }
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Percentage must be between 0 and 100");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTaxRateAction({
        name: name.trim(),
        percentage: pct,
        applicability,
      });

      if (result.success) {
        toast.success(`Tax rate "${name}" created successfully.`);
        router.push("/tax-rates");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create tax rate");
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
          href="/tax-rates"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Tax Rates
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              New Tax Rate
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configure Goods and Services Tax (GST) rate for sales or procurement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/tax-rates")}
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
              Save Tax Rate
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
          Tax Definition
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Tax Label"
            required
            placeholder="e.g. GST 18% (Furniture), GST 5% (Raw Timber)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormInput
            label="Rate Percentage (%)"
            type="number"
            required
            placeholder="18"
            min="0"
            max="100"
            step="0.01"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />

          <FormSelect
            label="Tax Applicability"
            value={applicability}
            onValueChange={(val) => setApplicability(val as TaxApplicability)}
            options={[
              { value: "BOTH", label: "Both Sales Invoices and Vendor Bills" },
              { value: "SALES", label: "Sales Invoices Only" },
              { value: "PURCHASE", label: "Vendor Bills Only" },
            ]}
          />
        </form>
      </Card>
    </div>
  );
}
