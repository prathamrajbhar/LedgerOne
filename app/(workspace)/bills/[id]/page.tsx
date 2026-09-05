import * as React from "react";
import { notFound } from "next/navigation";
import { getVendorBillByIdAction } from "@/app/actions/purchase.actions";
import { BillDetailClient } from "./bill-detail-client";
import { serializeBillData } from "./types";

export default async function VendorBillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getVendorBillByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const bill = serializeBillData(result.data as unknown as Record<string, unknown>);

  return <BillDetailClient initialBill={bill} />;
}
