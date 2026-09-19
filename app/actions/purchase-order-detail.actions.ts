"use server";

import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { requirePermission } from "@/lib/auth/guard";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getPurchaseOrderByIdAction(id: string) {
  try {
    await requirePermission("purchase:read");
    const po = await purchaseOrderService.findById(id);
    return { success: true, data: serialize(po) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch purchase order" };
  }
}

export async function cancelPurchaseOrderAction(id: string) {
  try {
    await requirePermission("purchase:confirm");
    const po = await purchaseOrderService.cancel(id);
    return { success: true, data: serialize(po) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel purchase order" };
  }
}
