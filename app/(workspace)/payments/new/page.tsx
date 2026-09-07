import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  getUnpaidInvoicesAction,
  getUnpaidBillsAction,
  type UnpaidDocument,
} from "@/app/actions/payment.actions";
import { PaymentCreateClient } from "./payment-create-client";

async function NewPaymentContent() {
  const [invoicesRes, billsRes] = await Promise.all([
    getUnpaidInvoicesAction(),
    getUnpaidBillsAction(),
  ]);

  const unpaidInvoices: UnpaidDocument[] =
    invoicesRes.success && invoicesRes.data ? invoicesRes.data : [];
  const unpaidBills: UnpaidDocument[] =
    billsRes.success && billsRes.data ? billsRes.data : [];

  return (
    <PaymentCreateClient
      initialInvoices={unpaidInvoices}
      initialBills={unpaidBills}
    />
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Payment Reconciliation Form...
          </p>
        </div>
      }
    >
      <NewPaymentContent />
    </Suspense>
  );
}
