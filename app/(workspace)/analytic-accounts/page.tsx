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
import { toast } from "sonner";

interface AnalyticAccount {
  id: string;
  code: string;
  name: string;
  spent: number;
  budget: number;
}

const initialAnalytics: AnalyticAccount[] = [
  { id: "an-1", code: "AN-HOTEL-OAK", name: "Grand Hyatt Bedroom Suites Project", spent: 450000, budget: 600000 },
  { id: "an-2", code: "AN-CORP-DESK", name: "Infosys Campus Ergonomic Desks Contract", spent: 320000, budget: 400000 },
  { id: "an-3", code: "AN-VILLA-TEAK", name: "Palm Meadows Villa Interior Furnishings", spent: 180000, budget: 250000 },
  { id: "an-4", code: "AN-EXHIBIT-2024", name: "India Furniture Expo 2024 Booth & Showcase", spent: 85000, budget: 100000 },
];

export default function AnalyticAccountsPage() {
  const [accounts, setAccounts] = React.useState(initialAnalytics);
  const [openModal, setOpenModal] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [budget, setBudget] = React.useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setAccounts([
      ...accounts,
      {
        id: `an-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        spent: 0,
        budget: Number(budget) || 100000,
      },
    ]);
    toast.success(`Analytic Account "${name}" created.`);
    setOpenModal(false);
    setCode("");
    setName("");
    setBudget("");
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
                  label="Project / Cost Center Code"
                  required
                  placeholder="e.g. AN-RESORT-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <FormInput
                  label="Project Title"
                  required
                  placeholder="e.g. Goa Luxury Villa Wooden Decking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormInput
                  label="Target Cost Budget (₹)"
                  type="number"
                  placeholder="300000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Create
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
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Project / Cost Center</th>
              <th className="py-3.5 px-4 text-right">Actual Cost Spent</th>
              <th className="py-3.5 px-4 text-right">Budget Limit</th>
              <th className="py-3.5 px-4 text-center">Utilization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.map((acc) => {
              const pct = ((acc.spent / acc.budget) * 100).toFixed(0);
              return (
                <tr key={acc.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{acc.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{acc.name}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{acc.spent.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground">
                    ₹{acc.budget.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-bold text-teal">{pct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
