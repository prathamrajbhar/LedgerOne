"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { processPortalInvoicePaymentAction } from "@/app/actions/portal-payment.actions";
import { toast } from "sonner";
import { PaymentMethod } from "@prisma/client";

interface PortalInvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
}

export function PortalPayClient({ invoice }: { invoice: PortalInvoiceData }) {
  const [payOption, setPayOption] = React.useState<"FULL" | "CUSTOM">("FULL");
  const [customAmount, setCustomAmount] = React.useState(invoice.amountDue.toString());
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [submitting, setSubmitting] = React.useState(false);
  const [paidSuccess, setPaidSuccess] = React.useState(false);

  const amountToPay = payOption === "FULL" ? invoice.amountDue : parseFloat(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (amountToPay > invoice.amountDue) {
      toast.error("Payment amount cannot exceed the balance due");
      return;
    }

    setSubmitting(true);
    try {
      const res = await processPortalInvoicePaymentAction({
        invoiceId: invoice.id,
        amount: amountToPay,
        paymentMethod,
        note: `Online payment recorded via Client Portal`,
      });

      if (res.success) {
        setPaidSuccess(true);
        toast.success("Payment successfully processed!");
        return;
      }
      toast.error(res.error || "Payment failed");
    } catch {
      toast.error("An error occurred while processing payment");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (paidSuccess) {
    return (
      <div className="rounded-xl border border-border bg-white p-10 text-center max-w-lg mx-auto shadow-card space-y-4">
        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-navy">Payment Confirmed</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your payment of <strong className="font-mono text-navy">{fmt(amountToPay)}</strong> for invoice{" "}
          <strong className="font-mono text-navy">{invoice.invoiceNumber}</strong> has been successfully verified and logged.
        </p>
        <div className="pt-2">
          <Link href="/portal/invoices">
            <Button size="sm" className="text-xs bg-navy text-white">
              Back to My Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <Link href="/portal/invoices" className="inline-flex items-center text-xs text-muted-foreground hover:text-navy mb-2">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Invoices
        </Link>
        <h1 className="text-xl font-bold text-navy">Pay Invoice {invoice.invoiceNumber}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Secure payment processing portal</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-card space-y-3 text-xs">
        <div className="flex justify-between py-1 border-b border-border/60">
          <span className="text-muted-foreground">Invoice Date</span>
          <span className="font-medium text-foreground">{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/60">
          <span className="text-muted-foreground">Total Invoiced</span>
          <span className="font-mono font-medium text-foreground">{fmt(invoice.total)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/60">
          <span className="text-muted-foreground">Amount Already Paid</span>
          <span className="font-mono font-medium text-green-700">{fmt(invoice.amountPaid)}</span>
        </div>
        <div className="flex justify-between py-1 pt-2">
          <span className="font-bold text-foreground">Current Balance Due</span>
          <span className="font-mono font-bold text-base text-red-600">{fmt(invoice.amountDue)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 shadow-card space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Payment Amount</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayOption("FULL")}
              className={`p-3 rounded-lg border text-left transition-all ${
                payOption === "FULL" ? "border-teal bg-teal/5 text-teal-dark font-semibold ring-1 ring-teal" : "border-border text-foreground hover:bg-muted/40"
              }`}
            >
              <div className="text-xs">Full Outstanding</div>
              <div className="font-mono font-bold text-sm mt-0.5">{fmt(invoice.amountDue)}</div>
            </button>

            <button
              type="button"
              onClick={() => setPayOption("CUSTOM")}
              className={`p-3 rounded-lg border text-left transition-all ${
                payOption === "CUSTOM" ? "border-teal bg-teal/5 text-teal-dark font-semibold ring-1 ring-teal" : "border-border text-foreground hover:bg-muted/40"
              }`}
            >
              <div className="text-xs">Custom Partial</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Specify amount</div>
            </button>
          </div>
        </div>

        {payOption === "CUSTOM" && (
          <FormInput
            label="Enter Custom Amount (₹)"
            type="number"
            step="0.01"
            min="1"
            max={invoice.amountDue}
            required
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
        )}

        <FormSelect
          label="Payment Gateway / Method"
          value={paymentMethod}
          onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
          options={[
            { value: PaymentMethod.BANK, label: "Netbanking / UPI (Direct Bank)" },
            { value: PaymentMethod.CASH, label: "Cash / In-Person Settlement" },
          ]}
        />

        <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-teal flex-shrink-0" />
          <span>Transactions are encrypted with 256-bit SSL and authenticated against your customer account.</span>
        </div>

        <Button
          type="submit"
          disabled={submitting || amountToPay <= 0}
          className="w-full h-10 text-xs font-semibold bg-navy hover:bg-navy-dark text-white gap-2"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Pay {fmt(amountToPay)} Now
        </Button>
      </form>
    </div>
  );
}
