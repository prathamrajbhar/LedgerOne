"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PortalPayInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const res = await fetch(`/api/sales/invoices`);
        if (res.ok) {
          const d = await res.json();
          const match = (d?.data || []).find((i: any) => i.id === invoiceId);
          if (match) setInvoice(match);
        }
      } catch (err) {
        console.error("Failed to load invoice:", err);
      } finally {
        setLoading(false);
      }
    }
    if (invoiceId) loadInvoice();
  }, [invoiceId]);

  const handlePayNow = async () => {
    setProcessing(true);
    setStatusBanner("Payment Processing — we'll update this once confirmed with the gateway.");

    try {
      const res = await fetch("/api/portal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount: invoice?.amountDue || 0,
          paymentMethod: "BANK",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Payment failed");
      }

      toast.success("Payment confirmed and recorded!");
      setPaidSuccess(true);
      setStatusBanner(null);
    } catch (error: any) {
      toast.error(error.message || "Payment unsuccessful");
      setStatusBanner(null);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Invoices
      </Link>

      {statusBanner && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {paidSuccess ? (
        <Card className="border-emerald-200 bg-emerald-50/50 text-center p-6">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Completed!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Your payment has been settled successfully and registered on the general ledger.
          </p>
          <Button onClick={() => router.push("/invoices")}>
            Return to My Invoices
          </Button>
        </Card>
      ) : (
        <Card className="rounded-xl border-border bg-white shadow-card overflow-hidden">
          <CardHeader className="border-b border-border bg-[#F9FAFB] py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-navy">Checkout & Payment</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invoice #{invoice?.invoiceNumber || invoiceId}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" /> 256-bit Encrypted
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Invoice Total:</span>
                <span className="text-foreground font-medium">
                  ₹{Number(invoice?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="text-emerald-700 font-medium">
                  ₹{Number(invoice?.amountPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border text-navy">
                <span>Amount Due Today:</span>
                <span className="text-base text-navy">
                  ₹{Number(invoice?.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="border border-border rounded-xl p-4 bg-white space-y-3">
              <p className="text-xs font-semibold text-foreground">Payment Provider</p>
              <div className="p-3 rounded-xl border-2 border-navy bg-primary-light/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-navy" />
                  <div>
                    <p className="font-semibold text-xs text-navy">Razorpay Gateway</p>
                    <p className="text-[11px] text-muted-foreground">UPI, Credit/Debit Cards, Net Banking</p>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-navy" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-[#F9FAFB] border-t border-border px-6 py-4 flex items-center justify-between">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handlePayNow}
              disabled={processing || Number(invoice?.amountDue || 0) <= 0}
              className="bg-navy hover:bg-navy-hover text-white text-xs gap-2 shadow-sm"
            >
              {processing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay ₹{Number(invoice?.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
