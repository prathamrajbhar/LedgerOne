"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
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

interface PaymentRecord {
  id: string;
  ref: string;
  party: string;
  method: string;
  direction: "INBOUND" | "OUTBOUND";
  date: string;
  account: string;
  amount: number;
}

const initialPayments: PaymentRecord[] = [
  { id: "1", ref: "PAY-2024-112", party: "HomeSpace Furniture", method: "NEFT / Bank Transfer", direction: "INBOUND", date: "15 Nov 2024", account: "1010 HDFC Bank Current A/c", amount: 75000 },
  { id: "2", ref: "PAY-2024-111", party: "WoodMart Timber Supplies", method: "RTGS", direction: "OUTBOUND", date: "14 Nov 2024", account: "1010 HDFC Bank Current A/c", amount: 48500 },
  { id: "3", ref: "PAY-2024-110", party: "Modern Living Interiors", method: "Razorpay Gateway", direction: "INBOUND", date: "12 Nov 2024", account: "1010 HDFC Bank Current A/c", amount: 125000 },
  { id: "4", ref: "PAY-2024-109", party: "Showroom Petty Cash Expenses", method: "Cash Register", direction: "OUTBOUND", date: "11 Nov 2024", account: "1020 Cash in Hand", amount: 12400 },
];

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState(initialPayments);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  const [party, setParty] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [direction, setDirection] = React.useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [account, setAccount] = React.useState("1010 HDFC Bank Current A/c");

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!party || !amount) return;

    const newPayment: PaymentRecord = {
      id: `p-${Date.now()}`,
      ref: `PAY-2024-${113 + payments.length}`,
      party,
      method: "Bank Transfer",
      direction,
      date: "20 Nov 2024",
      account,
      amount: Number(amount),
    };

    setPayments([newPayment, ...payments]);
    toast.success(`Payment voucher ${newPayment.ref} recorded and balanced.`);
    setOpenModal(false);
    setParty("");
    setAmount("");
  };

  const filtered = payments.filter((p) =>
    p.party.toLowerCase().includes(search.toLowerCase()) ||
    p.ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Banking"
        description="Record customer receipts, vendor disbursements, and view bank account clearing vouchers."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
                <FormSelect
                  label="Payment Type"
                  value={direction}
                  onValueChange={(val) => setDirection(val as "INBOUND" | "OUTBOUND")}
                  options={[
                    { value: "INBOUND", label: "Customer Receipt (Money In)" },
                    { value: "OUTBOUND", label: "Vendor Payment / Expense (Money Out)" },
                  ]}
                />
                <FormInput
                  label="Customer or Supplier Name"
                  required
                  placeholder="e.g. Modern Living Interiors"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                />
                <FormInput
                  label="Amount (₹)"
                  type="number"
                  required
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <FormSelect
                  label="Clearing Bank / Cash Account"
                  value={account}
                  onValueChange={setAccount}
                  options={[
                    { value: "1010 HDFC Bank Current A/c", label: "1010 HDFC Bank Current A/c" },
                    { value: "1020 Cash in Hand", label: "1020 Cash in Hand (Showroom)" },
                  ]}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Post Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments by ref or party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Payment #</th>
              <th className="py-3.5 px-4">Party / Counterparty</th>
              <th className="py-3.5 px-4">Mode</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Offset Account</th>
              <th className="py-3.5 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-primary-light/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-navy">{row.ref}</td>
                <td className="py-3.5 px-4 font-semibold text-foreground">{row.party}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row.method}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row.date}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row.account}</td>
                <td className={`py-3.5 px-4 text-right font-bold ${row.direction === "INBOUND" ? "text-success" : "text-destructive"}`}>
                  {row.direction === "INBOUND" ? "+" : "-"}₹{row.amount.toLocaleString("en-IN")}.00
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
