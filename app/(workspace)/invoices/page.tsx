"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

interface InvoiceItem {
  id: string;
  number: string;
  customer: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "DRAFT" | "PARTIAL";
}

const initialInvoices: InvoiceItem[] = [
  { id: "1", number: "INV-2024-1087", customer: "Modern Living Interiors", date: "18 Nov 2024", dueDate: "03 Dec 2024", subtotal: 105932, tax: 19068, total: 125000, status: "PAID" },
  { id: "2", number: "INV-2024-1086", customer: "Urban Deck Architectural", date: "14 Nov 2024", dueDate: "29 Nov 2024", subtotal: 81356, tax: 14644, total: 96000, status: "PARTIAL" },
  { id: "3", number: "INV-2024-1085", customer: "Prestige Executive Suites", date: "08 Nov 2024", dueDate: "23 Nov 2024", subtotal: 182203, tax: 32797, total: 215000, status: "OVERDUE" },
  { id: "4", number: "INV-2024-1084", customer: "HomeSpace Furniture", date: "02 Nov 2024", dueDate: "17 Nov 2024", subtotal: 63559, tax: 11441, total: 75000, status: "PAID" },
  { id: "5", number: "INV-2024-1083", customer: "The Grand Haven Hotel", date: "28 Oct 2024", dueDate: "12 Nov 2024", subtotal: 149152, tax: 26848, total: 176000, status: "PENDING" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [openModal, setOpenModal] = React.useState(false);

  // Form state
  const [customer, setCustomer] = React.useState("Modern Living Interiors");
  const [amount, setAmount] = React.useState("");

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const num = Number(amount);
    const tax = Math.round(num * 0.18);
    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      number: `INV-2024-${1088 + invoices.length}`,
      customer,
      date: "20 Nov 2024",
      dueDate: "05 Dec 2024",
      subtotal: num,
      tax,
      total: num + tax,
      status: "PENDING",
    };

    setInvoices([newInv, ...invoices]);
    toast.success(`Invoice ${newInv.number} created and posted to receivables.`);
    setOpenModal(false);
    setAmount("");
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Invoices"
        description="Issue professional GST sales invoices for furniture deliveries and track customer receivables."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise Customer Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
                <FormSelect
                  label="Select Customer"
                  value={customer}
                  onValueChange={setCustomer}
                  options={[
                    { value: "Modern Living Interiors", label: "Modern Living Interiors" },
                    { value: "HomeSpace Furniture", label: "HomeSpace Furniture" },
                    { value: "Urban Deck Architectural", label: "Urban Deck Architectural" },
                    { value: "Prestige Executive Suites", label: "Prestige Executive Suites" },
                  ]}
                />
                <FormInput
                  label="Subtotal Amount (₹)"
                  type="number"
                  required
                  placeholder="e.g. 85000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  helperText="18% Furniture GST will be calculated automatically."
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Confirm & Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or customer name..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
          {["ALL", "PAID", "PENDING", "OVERDUE", "PARTIAL"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === s
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All Invoices" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Tax (18%)</th>
                <th className="py-3.5 px-4 text-right">Total Payable</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{inv.number}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{inv.customer}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{inv.date}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground">
                    ₹{inv.tax.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{inv.total.toLocaleString("en-IN")}.00
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success(`PDF invoice generated for ${inv.number}`)}
                      className="h-7 px-2 text-muted-foreground hover:text-navy"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
