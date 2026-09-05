"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";

interface RecordInvoicePaymentDialogProps {
  invoiceId: string;
  amountDue: number;
}

export function RecordInvoicePaymentDialog({
  invoiceId,
  amountDue,
}: RecordInvoicePaymentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(amountDue.toString());
  const [paymentMethod, setPaymentMethod] = useState("BANK");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    const payNum = parseFloat(amount);
    if (isNaN(payNum) || payNum <= 0) {
      toast.error("Please enter a valid positive payment amount");
      return;
    }
    if (payNum > amountDue) {
      toast.error(`Payment amount cannot exceed amount due ($${amountDue.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sales/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payNum,
          paymentMethod,
          note,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to record payment");
      }

      toast.success("Payment recorded successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <DollarSign className="h-4 w-4" /> Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Customer Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={amountDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum receivable: ${amountDue.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <select
              id="method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes / Reference</Label>
            <Input
              id="note"
              placeholder="Bank reference, deposit slip #, or note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
