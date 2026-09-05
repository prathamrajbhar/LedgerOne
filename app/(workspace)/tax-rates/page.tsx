"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  getTaxRatesAction,
  createTaxRateAction,
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
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [percentage, setPercentage] = React.useState("");
  const [applicability, setApplicability] = React.useState<TaxApplicability>("BOTH");

  // Fetch tax rates on mount
  React.useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    setLoading(true);
    try {
      const result = await getTaxRatesAction();
      if (result.success && result.data) {
        setRates(result.data);
      } else {
        toast.error(result.error || "Failed to load tax rates");
      }
    } catch (error) {
      toast.error("Failed to load tax rates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || percentage === "") return;

    setSubmitting(true);
    try {
      const result = await createTaxRateAction({
        name,
        percentage: Number(percentage),
        applicability,
      });

      if (result.success) {
        toast.success(`Tax Rate "${name}" configured.`);
        setOpenModal(false);
        setName("");
        setPercentage("");
        setApplicability("BOTH");
        await loadTaxRates();
      } else {
        toast.error(result.error || "Failed to create tax rate");
      }
    } catch (error) {
      toast.error("Failed to create tax rate");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

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
    } catch (error) {
      toast.error("Failed to delete tax rate");
      console.error(error);
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
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Tax Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tax Rate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <FormInput
                  label="Tax Label"
                  required
                  placeholder="e.g. GST 18% (Furniture)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
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
                  disabled={submitting}
                />
                <FormSelect
                  label="Tax Applicability"
                  value={applicability}
                  onValueChange={(val) => setApplicability(val as TaxApplicability)}
                  options={[
                    { value: "BOTH", label: "Both Sales and Purchases" },
                    { value: "SALES", label: "Sales Invoices Only" },
                    { value: "PURCHASE", label: "Vendor Bills Only" },
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
                    {submitting ? "Saving..." : "Save Tax Rate"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
            Click &quot;New Tax Rate&quot; to add your first GST slab.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Tax Name</th>
                <th className="py-3.5 px-4 text-right">Percentage Rate</th>
                <th className="py-3.5 px-4">Applicability</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rates.map((t) => (
                <tr key={t.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">{t.name}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-navy">{t.percentage}%</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                      {applicabilityLabel(t.applicability)}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                      onClick={() => handleDelete(t.id, t.name)}
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
