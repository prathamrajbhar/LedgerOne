"use server";

import { salesOrderService } from "@/lib/services/sales-order.service";
import { requirePermission } from "@/lib/auth/guard";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getSalesOrderByIdAction(id: string) {
  try {
    await requirePermission("sales:read");
    const salesOrder = await salesOrderService.findById(id);
    return { success: true, data: serialize(salesOrder) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch sales order" };
  }
}

export async function cancelSalesOrderAction(id: string) {
  try {
    await requirePermission("sales:confirm");
    const salesOrder = await salesOrderService.cancel(id);
    return { success: true, data: serialize(salesOrder) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel sales order" };
  }
}
