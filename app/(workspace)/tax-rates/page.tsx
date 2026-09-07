"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getTaxRatesAction,
  deleteTaxRateAction,
} from "@/app/actions/tax-rate.actions";
import { TaxApplicability } from "@prisma/client";

interface TaxRateItem {
  id: string;
  name: string;
  percentage: number;
  applicability: TaxApplicability;
}

export default function TaxRatesPage() {
  const [rates, setRates] = React.useState<TaxRateItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadTaxRates = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTaxRatesAction();
      if (result.success && result.data) {
        setRates(result.data as TaxRateItem[]);
      } else {
        toast.error(result.error || "Failed to load tax rates");
      }
    } catch {
      toast.error("Failed to load tax rates");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTaxRates();
  }, [loadTaxRates]);

  const handleDelete = async (id: string, taxName: string) => {
    if (!confirm(`Are you sure you want to delete "${taxName}"?`)) return;

    try {
      const result = await deleteTaxRateAction(id);
      if (result.success) {
        toast.success("Tax rate deleted successfully");
        await loadTaxRates();
      } else {
        toast.error(result.error || "Failed to delete tax rate");
      }
    } catch {
      toast.error("Failed to delete tax rate");
    }
  };

  const applicabilityLabel = (app: TaxApplicability) => {
    switch (app) {
      case "SALES":
        return "Sales Only";
      case "PURCHASE":
        return "Purchase Only";
      case "BOTH":
        return "Both";
      default:
        return app;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tax Rates & GST Slabs"
        description="Configure standard Goods & Services Tax (GST) slabs for customer invoicing and vendor bills."
        actions={
          <Link href="/tax-rates/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              New Tax Rate
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading tax rates...</p>
        </div>
      ) : rates.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">No tax rates configured yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;New Tax Rate&quot; to define GST slabs (e.g. GST 5%, GST 18%, Exempt).
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tax Name</th>
                  <th className="py-3.5 px-4">Rate (%)</th>
                  <th className="py-3.5 px-4">Applies To</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{rate.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {rate.percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                        {applicabilityLabel(rate.applicability)}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                        onClick={() => handleDelete(rate.id, rate.name)}
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
