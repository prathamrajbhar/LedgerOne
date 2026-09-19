import * as React from "react";
import { notFound } from "next/navigation";
import { getSalesOrderByIdAction } from "@/app/actions/sales-order-detail.actions";
import { SalesOrderDetailClient } from "./sales-order-detail-client";
import type { SerializedSalesOrder } from "./types";

export default async function SalesOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getSalesOrderByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data as unknown as SerializedSalesOrder;

  return <SalesOrderDetailClient initialOrder={order} />;
}
