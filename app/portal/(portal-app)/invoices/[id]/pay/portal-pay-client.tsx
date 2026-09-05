"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Receipt,
  Clock,
  Lock,
  Landmark,
  Banknote,
  Sparkles,
} from "lucide-react";
import {
  processPortalInvoicePaymentAction,
  createPortalRazorpayOrderAction,
  verifyPortalRazorpayPaymentAction,
} from "@/app/actions/portal-payment.actions";
import { toast } from "sonner";
import { PaymentMethod } from "@prisma/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface InvoiceLineSummary {
  name: string;
  quantity: number;
  lineTotal: number;
}

interface PortalInvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  customerName?: string;
  customerEmail?: string;
  soNumber?: string | null;
  lines?: InvoiceLineSummary[];
}

export function PortalPayClient({ invoice }: { invoice: PortalInvoiceData }) {
  const [payOption, setPayOption] = React.useState<"FULL" | "CUSTOM">("FULL");
  const [customAmount, setCustomAmount] = React.useState(invoice.amountDue.toString());
  const [paymentMethod, setPaymentMethod] = React.useState<"RAZORPAY" | "CASH">("RAZORPAY");
  const [submitting, setSubmitting] = React.useState(false);
  const [paidSuccess, setPaidSuccess] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);

  const amountToPay = payOption === "FULL" ? invoice.amountDue : parseFloat(customAmount) || 0;

  const handleRazorpayPayment = async () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Razorpay SDK is loading. Please try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create order on server
      const orderRes = await createPortalRazorpayOrderAction({
        invoiceId: invoice.id,
        amount: amountToPay,
      });

      if (!orderRes.success || !orderRes.orderId) {
        toast.error(orderRes.error || "Failed to initialize payment gateway");
        setSubmitting(false);
        return;
      }

      // 2. Configure Razorpay options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "LedgerOne",
        description: `Invoice Payment #${orderRes.invoiceNumber}`,
        order_id: orderRes.orderId,
        image: "/logo.png",
        prefill: {
          name: orderRes.customerName || invoice.customerName || "",
          email: orderRes.customerEmail || invoice.customerEmail || "",
        },
        theme: {
          color: "#16324F",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.info("Payment window closed");
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 3. Verify payment signature on server
            const verifyRes = await verifyPortalRazorpayPaymentAction({
              invoiceId: invoice.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: amountToPay,
            });

            if (verifyRes.success) {
              setPaidSuccess(true);
              toast.success("Payment verified & invoice settled successfully!");
            } else {
              toast.error(verifyRes.error || "Payment verification failed");
            }
          } catch {
            toast.error("An error occurred while confirming payment");
          } finally {
            setSubmitting(false);
          }
        },
      };

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        toast.error(resp.error?.description || "Payment failed at gateway");
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      toast.error("Failed to connect with Razorpay");
      setSubmitting(false);
    }
  };

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

    if (paymentMethod === "RAZORPAY") {
      await handleRazorpayPayment();
      return;
    }

    // Direct / Cash settlement
    setSubmitting(true);
    try {
      const res = await processPortalInvoicePaymentAction({
        invoiceId: invoice.id,
        amount: amountToPay,
        paymentMethod: PaymentMethod.CASH,
        note: `Direct settlement recorded via Client Portal`,
      });

      if (res.success) {
        setPaidSuccess(true);
        toast.success("Settlement logged successfully!");
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
      <div className="max-w-xl mx-auto py-8">
        <div className="rounded-xl border border-border bg-white p-8 sm:p-10 text-center shadow-card space-y-5">
          <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">Payment Confirmed</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Transaction verified and reconciled with LedgerOne Accounting
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-border/70 rounded-xl p-4 text-xs space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Reference</span>
              <span className="font-mono font-bold text-navy">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Settled</span>
              <span className="font-bold text-green-700 font-mono">{fmt(amountToPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gateway / Channel</span>
              <span className="font-semibold text-navy">
                {paymentMethod === "RAZORPAY" ? "Razorpay Gateway (UPI/Cards/Netbanking)" : "Direct Settlement"}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Remaining Balance</span>
              <span className="font-mono font-bold text-foreground">
                {fmt(Math.max(0, invoice.amountDue - amountToPay))}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/portal/invoices">
              <Button size="sm" className="w-full sm:w-auto text-xs bg-navy hover:bg-navy-dark text-white px-5">
                Back to Invoices
              </Button>
            </Link>
            <Link href="/portal/payments">
              <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs border-border px-5">
                View Payment History
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Razorpay Checkout SDK Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Breadcrumb & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-5">
          <div>
            <Link
              href="/portal/invoices"
              className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-navy transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Invoices
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Pay Invoice {invoice.invoiceNumber}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="h-3 w-3" /> Payment Due
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Review invoice breakdown and execute secure online payment via Razorpay.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-lg shadow-xs text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-teal" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Invoice Details & Line Items (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Invoice Summary Card */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-navy" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Invoice Breakdown
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-navy">{invoice.invoiceNumber}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Issue Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Payment Due Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {invoice.soNumber && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Sales Order Reference</span>
                    <span className="font-semibold text-navy">{invoice.soNumber}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5 border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Total Invoiced</span>
                  <span className="font-mono font-medium text-foreground">{fmt(invoice.total)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Amount Already Paid</span>
                  <span className="font-mono font-medium text-green-700">{fmt(invoice.amountPaid)}</span>
                </div>

                {/* Outstanding Highlight Pill */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBFD] border border-border mt-3">
                  <span className="font-bold text-foreground text-xs">Outstanding Balance</span>
                  <span className="font-mono font-bold text-lg text-destructive">{fmt(invoice.amountDue)}</span>
                </div>
              </div>
            </div>

            {/* Line Items Card if present */}
            {invoice.lines && invoice.lines.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Itemized Summary
                </h3>
                <div className="divide-y divide-border/60 text-xs">
                  {invoice.lines.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-navy">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-semibold text-foreground">{fmt(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Payment Execution Form (7 cols) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-border bg-white p-6 sm:p-7 shadow-card space-y-6"
            >
              <div className="border-b border-border/70 pb-3">
                <h2 className="text-sm font-bold text-navy uppercase tracking-wide">
                  Choose Payment Option
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select full balance settlement or specify a custom partial sum
                </p>
              </div>

              {/* Payment Amount Option Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  Settlement Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayOption("FULL")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      payOption === "FULL"
                        ? "border-navy bg-[#F6F8FA] text-navy font-semibold ring-2 ring-navy/15 shadow-xs"
                        : "border-border text-foreground hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Full Outstanding</div>
                    <div className="font-mono font-bold text-base text-navy mt-1">
                      {fmt(invoice.amountDue)}
                    </div>
                    <span className="text-[10px] text-teal font-medium mt-1 inline-block">
                      ✓ Clear full balance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayOption("CUSTOM")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      payOption === "CUSTOM"
                        ? "border-navy bg-[#F6F8FA] text-navy font-semibold ring-2 ring-navy/15 shadow-xs"
                        : "border-border text-foreground hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Custom Partial</div>
                    <div className="font-mono font-bold text-base text-navy mt-1">
                      {payOption === "CUSTOM" && customAmount ? fmt(parseFloat(customAmount) || 0) : "₹0.00"}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                      Specify custom sum
                    </span>
                  </button>
                </div>
              </div>

              {/* Custom Amount Input */}
              {payOption === "CUSTOM" && (
                <div className="p-4 rounded-xl bg-[#FAFBFD] border border-border space-y-2">
                  <FormInput
                    label="Enter Custom Partial Amount (₹)"
                    type="number"
                    step="0.01"
                    min="1"
                    max={invoice.amountDue}
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Maximum allowable payment: <strong className="font-mono">{fmt(invoice.amountDue)}</strong>
                  </p>
                </div>
              )}

              {/* Payment Channel Cards with Razorpay */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  Select Payment Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay Gateway Option */}
                  <div
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${
                      paymentMethod === "RAZORPAY"
                        ? "border-navy bg-[#F6F8FA] ring-2 ring-navy/15 shadow-xs"
                        : "border-border hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0F7] text-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-navy">Razorpay Gateway</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal/10 text-teal uppercase">
                          Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        UPI, Cards, Netbanking & Wallets with instant verification
                      </p>
                    </div>
                  </div>

                  {/* Cash / Counter Option */}
                  <div
                    onClick={() => setPaymentMethod("CASH")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === "CASH"
                        ? "border-navy bg-[#F6F8FA] ring-2 ring-navy/15 shadow-xs"
                        : "border-border hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E7F5F5] text-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy">Direct Settlement</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        In-person cashier settlement or physical cheque clearance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Ledger Notice */}
              <div className="p-3.5 bg-[#F8FAFC] border border-border/80 rounded-xl flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-teal flex-shrink-0" />
                <div className="leading-snug text-[11px]">
                  {paymentMethod === "RAZORPAY" ? (
                    <span>
                      Razorpay processes payments securely under RBI guidelines. Once successful, LedgerOne automatically marks the invoice as paid and generates the journal entry.
                    </span>
                  ) : (
                    <span>
                      Direct settlement is registered in real-time and creates a verified journal entry in LedgerOne.
                    </span>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={submitting || amountToPay <= 0}
                className="w-full h-11 text-xs font-semibold bg-navy hover:bg-navy-dark text-white gap-2 shadow-sm rounded-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {paymentMethod === "RAZORPAY"
                        ? `Pay ${fmt(amountToPay)} via Razorpay`
                        : `Confirm Settlement ${fmt(amountToPay)}`}
                    </span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
