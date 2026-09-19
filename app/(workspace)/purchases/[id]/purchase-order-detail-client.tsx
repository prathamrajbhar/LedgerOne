"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmPurchaseOrderAction, createBillFromPurchaseOrderAction } from "@/app/actions/purchase.actions";
import { cancelPurchaseOrderAction } from "@/app/actions/purchase-order-detail.actions";
import { PoHeader } from "./components/po-header";
import { PoKpiStrip } from "./components/po-kpi-strip";
import { PoVendorCard } from "./components/po-vendor-card";
import { PoLinesTable } from "./components/po-lines-table";
import { PoBillsCard } from "./components/po-bills-card";
import type { SerializedPurchaseOrder } from "./types";

export function PurchaseOrderDetailClient({ initialPo }: { initialPo: SerializedPurchaseOrder }) {
  const router = useRouter();
  const [po, setPo] = React.useState<SerializedPurchaseOrder>(initialPo);
  const [confirming, setConfirming] = React.useState(false);
  const [creatingBill, setCreatingBill] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const result = await confirmPurchaseOrderAction(po.id);
      if (result.success) {
        toast.success("Purchase order confirmed successfully");
        setPo((prev) => ({ ...prev, status: "CONFIRMED" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm purchase order");
      }
    } catch {
      toast.error("Failed to confirm purchase order");
    } finally {
      setConfirming(false);
    }
  };

  const handleCreateBill = async () => {
    setCreatingBill(true);
    try {
      const result = await createBillFromPurchaseOrderAction(po.id);
      if (result.success && result.data) {
        toast.success("Vendor bill generated from purchase order");
        router.push(`/bills/${(result.data as { id: string }).id}`);
      } else {
        toast.error(result.error || "Failed to create vendor bill");
      }
    } catch {
      toast.error("Failed to create vendor bill");
    } finally {
      setCreatingBill(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this purchase order?")) return;
    setCancelling(true);
    try {
      const result = await cancelPurchaseOrderAction(po.id);
      if (result.success) {
        toast.success("Purchase order has been cancelled");
        setPo((prev) => ({ ...prev, status: "CANCELLED" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel purchase order");
      }
    } catch {
      toast.error("Failed to cancel purchase order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PoHeader
        po={po}
        confirming={confirming}
        creatingBill={creatingBill}
        cancelling={cancelling}
        onConfirm={handleConfirm}
        onCreateBill={handleCreateBill}
        onCancel={handleCancel}
      />

      <PoKpiStrip po={po} />

      <PoVendorCard po={po} />

      <PoLinesTable lines={po.lines} total={po.total} />

      <PoBillsCard bills={po.vendorBills} />
    </div>
  );
}
