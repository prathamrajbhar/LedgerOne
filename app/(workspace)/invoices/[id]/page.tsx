import * as React from "react";
import { notFound } from "next/navigation";
import { getInvoiceByIdAction } from "@/app/actions/sales.actions";
import { InvoiceDetailClient } from "./invoice-detail-client";
import { serializeInvoiceData } from "./types";

export default async function CustomerInvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getInvoiceByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const invoice = serializeInvoiceData(
    result.data as unknown as Record<string, unknown>
  );

  return <InvoiceDetailClient initialInvoice={invoice} />;
}
