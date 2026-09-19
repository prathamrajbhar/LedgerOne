import * as React from "react";
import { notFound } from "next/navigation";
import { getPaymentByIdAction } from "@/app/actions/payment-detail.actions";
import { PaymentHeader } from "./components/payment-header";
import { PaymentVoucherCard } from "./components/payment-voucher-card";
import { PaymentLedgerCard } from "./components/payment-ledger-card";
import type { SerializedPaymentRecord } from "./types";

export default async function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getPaymentByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const payment = result.data as unknown as SerializedPaymentRecord;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PaymentHeader payment={payment} />
      <PaymentVoucherCard payment={payment} />
      <PaymentLedgerCard journalEntry={payment.journalEntry} />
    </div>
  );
}
