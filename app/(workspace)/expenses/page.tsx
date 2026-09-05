"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

interface ExpenseRecord {
  id: string;
  code: string;
  category: string;
  title: string;
  vendor: string;
  date: string;
  amount: number;
}

const initialExpenses: ExpenseRecord[] = [
  { id: "1", code: "EXP-2024-078", category: "Rent & Utilities", title: "Showroom Commercial Rent - November", vendor: "Property Owners Trust", date: "16 Nov 2024", amount: 25000 },
  { id: "2", code: "EXP-2024-077", category: "Manufacturing", title: "CNC Router Tooling & Saw Blades", vendor: "Apex Tooling Solutions", date: "12 Nov 2024", amount: 14500 },
  { id: "3", code: "EXP-2024-076", category: "Raw Materials", title: "Teak Wood Finishing PU Polish & Thinner", vendor: "Asian Paints Woodtech", date: "09 Nov 2024", amount: 18200 },
  { id: "4", code: "EXP-2024-075", category: "Transport", title: "Freight & Delivery for Mumbai Project", vendor: "VRL Logistics Ltd", date: "05 Nov 2024", amount: 8400 },
  { id: "5", code: "EXP-2024-074", category: "Salaries", title: "Workshop Master Carpenters Advance", vendor: "Direct Staff Payroll", date: "01 Nov 2024", amount: 45000 },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState(initialExpenses);
  const [openModal, setOpenModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Raw Materials");
  const [vendor, setVendor] = React.useState("");
  const [amount, setAmount] = React.useState("");

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      code: `EXP-2024-${79 + expenses.length}`,
      category,
      title,
      vendor: vendor || "Direct Payment",
      date: "20 Nov 2024",
      amount: Number(amount),
    };

    setExpenses([newExp, ...expenses]);
    toast.success(`Expense ${newExp.code} recorded in General Ledger.`);
    setOpenModal(false);
    setTitle("");
    setVendor("");
    setAmount("");
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational & Material Expenses"
        description="Record production costs, raw timber supplies, workshop utilities, and staff logistics."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Operational Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordExpense} className="space-y-4 pt-2">
                <FormInput
                  label="Expense Title / Description"
                  required
                  placeholder="e.g. Sawmill Timber Cutting Services"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <FormSelect
                  label="Expense Category"
                  value={category}
                  onValueChange={setCategory}
                  options={[
                    { value: "Raw Materials", label: "Raw Materials (Timber, Foam, Polish)" },
                    { value: "Manufacturing", label: "Manufacturing & Machinery Tooling" },
                    { value: "Salaries", label: "Salaries & Workshop Labor" },
                    { value: "Rent & Utilities", label: "Rent & Showroom Utilities" },
                    { value: "Transport", label: "Transport & Shipping Logistics" },
                    { value: "Marketing", label: "Marketing & Catalog Photoshoots" },
                  ]}
                />
                <FormInput
                  label="Paid to Vendor / Party"
                  placeholder="e.g. City Sawmill Ltd"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
                <FormInput
                  label="Amount (₹)"
                  type="number"
                  required
                  placeholder="12500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Post Expense
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Recorded Expenses</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Current Month Total</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Largest Category</span>
          <p className="text-xl font-bold text-navy mt-1">Raw Materials</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">28.4% of total expenses</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Tax Deductible</span>
          <p className="text-xl font-bold text-teal mt-1">₹{(totalExpenses * 0.18).toFixed(0)}</p>
          <span className="text-[11px] text-teal block mt-0.5">Input Tax Credit (ITC)</span>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Voucher #</th>
              <th className="py-3.5 px-4">Expense Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Paid To</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-primary-light/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-navy">{e.code}</td>
                <td className="py-3.5 px-4 font-semibold text-foreground">{e.title}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{e.category}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{e.vendor}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{e.date}</td>
                <td className="py-3.5 px-4 text-right font-bold text-foreground">
                  ₹{e.amount.toLocaleString("en-IN")}.00
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
