"use server";

import { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { requirePermission } from "@/lib/auth/guard";
import {
  getPurchaseOrdersAction as fetchPurchaseOrders,
  getVendorBillsAction as fetchVendorBills,
  getVendorBillByIdAction as fetchVendorBillById,
} from "./purchase-query.actions";
import {
  createStandaloneBillAction as createBill,
  confirmBillAction as confirmBill,
  cancelBillAction as cancelBill,
  CreateVendorBillInput,
} from "./purchase-mutation.actions";

export type { CreateVendorBillInput };

export async function getPurchaseOrdersAction() {
  return fetchPurchaseOrders();
}

export async function getVendorBillsAction() {
  return fetchVendorBills();
}

export async function getVendorBillByIdAction(id: string) {
  return fetchVendorBillById(id);
}

export async function createStandaloneBillAction(input: CreateVendorBillInput) {
  return createBill(input);
}

export async function confirmBillAction(id: string) {
  return confirmBill(id);
}

export async function cancelBillAction(id: string) {
  return cancelBill(id);
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  orderDate: Date;
  createdById?: string;
  lines: {
    productId: string;
    analyticAccountId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function createPurchaseOrderAction(input: CreatePurchaseOrderInput) {
  try {
    const { user } = await requirePermission("purchase:write");

    let total = 0;
    const lineDatas = input.lines.map((line) => {
      const lineTotal = line.quantity * line.unitPrice;
      total += lineTotal;
      return {
        productId: line.productId,
        analyticAccountId: line.analyticAccountId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal,
      };
    });

    const poNumber = `PO-${Date.now()}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: input.vendorId,
        orderDate: input.orderDate,
        status: DocumentStatus.DRAFT,
        total,
        createdById: user.id,
        lines: { create: lineDatas },
      },
      include: { vendor: true, lines: true },
    });

    return { success: true, data: po };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create purchase order" };
  }
}

export async function confirmPurchaseOrderAction(id: string) {
  try {
    await requirePermission("purchase:confirm");
    const po = await purchaseOrderService.confirm(id);
    return { success: true, data: po };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm purchase order" };
  }
}

export async function cancelPurchaseOrderAction(id: string) {
  try {
    await requirePermission("purchase:cancel");
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: DocumentStatus.CANCELLED },
    });
    return { success: true, data: po };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel purchase order" };
  }
}

export async function createBillFromPurchaseOrderAction(poId: string) {
  try {
    const { user } = await requirePermission("purchase:write");
    const bill = await vendorBillService.createFromPurchaseOrder(poId, user.id);
    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create vendor bill from purchase order" };
  }
}
