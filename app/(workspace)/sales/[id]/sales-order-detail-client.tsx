"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmSalesOrderAction, createInvoiceFromSalesOrderAction } from "@/app/actions/sales.actions";
import { cancelSalesOrderAction } from "@/app/actions/sales-order-detail.actions";
import { SoHeader } from "./components/so-header";
import { SoKpiStrip } from "./components/so-kpi-strip";
import { SoCustomerCard } from "./components/so-customer-card";
import { SoLinesTable } from "./components/so-lines-table";
import { SoInvoicesCard } from "./components/so-invoices-card";
import type { SerializedSalesOrder } from "./types";

export function SalesOrderDetailClient({ initialOrder }: { initialOrder: SerializedSalesOrder }) {
  const router = useRouter();
  const [order, setOrder] = React.useState<SerializedSalesOrder>(initialOrder);
  const [confirming, setConfirming] = React.useState(false);
  const [creatingInvoice, setCreatingInvoice] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const result = await confirmSalesOrderAction(order.id);
      if (result.success) {
        toast.success("Sales order confirmed successfully");
        setOrder((prev) => ({ ...prev, status: "CONFIRMED" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm sales order");
      }
    } catch {
      toast.error("Failed to confirm sales order");
    } finally {
      setConfirming(false);
    }
  };

  const handleCreateInvoice = async () => {
    setCreatingInvoice(true);
    try {
      const result = await createInvoiceFromSalesOrderAction(order.id);
      if (result.success && result.data) {
        toast.success("Customer invoice generated from sales order");
        router.push(`/invoices/${(result.data as { id: string }).id}`);
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch {
      toast.error("Failed to create customer invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this sales order?")) return;
    setCancelling(true);
    try {
      const result = await cancelSalesOrderAction(order.id);
      if (result.success) {
        toast.success("Sales order has been cancelled");
        setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel sales order");
      }
    } catch {
      toast.error("Failed to cancel sales order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <SoHeader
        order={order}
        confirming={confirming}
        creatingInvoice={creatingInvoice}
        cancelling={cancelling}
        onConfirm={handleConfirm}
        onCreateInvoice={handleCreateInvoice}
        onCancel={handleCancel}
      />

      <SoKpiStrip order={order} />

      <SoCustomerCard order={order} />

      <SoLinesTable lines={order.lines} total={order.total} />

      <SoInvoicesCard invoices={order.invoices} />
    </div>
  );
}
