import * as React from "react";
import { notFound } from "next/navigation";
import { getPurchaseOrderByIdAction } from "@/app/actions/purchase-order-detail.actions";
import { PurchaseOrderDetailClient } from "./purchase-order-detail-client";
import type { SerializedPurchaseOrder } from "./types";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getPurchaseOrderByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const po = result.data as unknown as SerializedPurchaseOrder;

  return <PurchaseOrderDetailClient initialPo={po} />;
}
