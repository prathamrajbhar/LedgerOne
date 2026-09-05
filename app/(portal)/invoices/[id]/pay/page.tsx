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
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Checkout & Payment</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invoice #{invoice?.invoiceNumber || invoiceId}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                <ShieldCheck className="h-4 w-4" /> 256-bit Encrypted
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="p-4 rounded-lg bg-gray-50 border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice Total:</span>
                <span className="text-gray-900 font-medium">
                  ${Number(invoice?.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="text-emerald-600 font-medium">
                  ${Number(invoice?.amountPaid || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t text-gray-900">
                <span>Amount Due Today:</span>
                <span className="text-primary text-xl">
                  ${Number(invoice?.amountDue || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Payment Provider
              </p>
              <div className="p-3.5 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      Razorpay Gateway
                    </p>
                    <p className="text-xs text-muted-foreground">
                      UPI, Credit/Debit Cards, Net Banking
                    </p>
                  </div>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base"
              onClick={handlePayNow}
              disabled={processing || Number(invoice?.amountDue || 0) <= 0}
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authorizing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay ${Number(invoice?.amountDue || 0).toFixed(2)} Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
