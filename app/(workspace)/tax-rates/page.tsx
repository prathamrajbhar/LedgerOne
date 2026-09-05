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

interface TaxRateItem {
  id: string;
  name: string;
  rate: number;
  scope: "SALES" | "PURCHASE" | "BOTH";
  description: string;
}

const initialTaxRates: TaxRateItem[] = [
  { id: "tax-1", name: "GST 18% (Standard Furniture)", rate: 18, scope: "BOTH", description: "Standard GST for finished wooden and metal furniture." },
  { id: "tax-2", name: "GST 12% (Wood Turnings & Moldings)", rate: 12, scope: "BOTH", description: "Turned wood articles, bamboo products, and moldings." },
  { id: "tax-3", name: "GST 28% (Luxury & Coir Mattresses)", rate: 28, scope: "SALES", description: "Luxury spring mattresses and premium upholstered seating." },
  { id: "tax-4", name: "GST 5% (Raw Timber & Sawn Logs)", rate: 5, scope: "PURCHASE", description: "Raw timber logs, veneer sheets, and sawn lumber." },
  { id: "tax-5", name: "GST 0% (Tax Exempt Exports)", rate: 0, scope: "SALES", description: "SEZ sales and zero-rated international furniture exports." },
];

export default function TaxRatesPage() {
  const [rates, setRates] = React.useState(initialTaxRates);
  const [openModal, setOpenModal] = React.useState(false);
  const [name, setName] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [scope, setScope] = React.useState<TaxRateItem["scope"]>("BOTH");
  const [desc, setDesc] = React.useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || rate === "") return;
    setRates([
      ...rates,
      {
        id: `tax-${Date.now()}`,
        name,
        rate: Number(rate),
        scope,
        description: desc,
      },
    ]);
    toast.success(`Tax Rate "${name}" configured.`);
    setOpenModal(false);
    setName("");
    setRate("");
    setDesc("");
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
                />
                <FormInput
                  label="Rate Percentage (%)"
                  type="number"
                  required
                  placeholder="18"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <FormSelect
                  label="Tax Scope"
                  value={scope}
                  onValueChange={(val) => setScope(val as TaxRateItem["scope"])}
                  options={[
                    { value: "BOTH", label: "Both Sales and Purchases" },
                    { value: "SALES", label: "Sales Invoices Only" },
                    { value: "PURCHASE", label: "Vendor Bills Only" },
                  ]}
                />
                <FormInput
                  label="Description / HSN Category"
                  placeholder="e.g. HSN 9403 Wooden Furniture"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Save Tax Rate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Tax Name</th>
              <th className="py-3.5 px-4 text-right">Percentage Rate</th>
              <th className="py-3.5 px-4">Scope</th>
              <th className="py-3.5 px-4">Description / HSN Classification</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map((t) => (
              <tr key={t.id} className="hover:bg-primary-light/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-foreground">{t.name}</td>
                <td className="py-3.5 px-4 text-right font-bold text-navy">{t.rate}%</td>
                <td className="py-3.5 px-4">
                  <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                    {t.scope}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">{t.description}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
