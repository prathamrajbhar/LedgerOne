"use server";

import { PrismaClient, DocumentStatus } from "@prisma/client";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";

const prisma = new PrismaClient();

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
        createdById: input.createdById || "system",
        lines: {
          create: lineDatas,
        },
      },
      include: {
        vendor: true,
        lines: true,
      },
    });

    return { success: true, data: po };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create purchase order" };
  }
}

export async function confirmPurchaseOrderAction(id: string) {
  try {
    const po = await purchaseOrderService.confirm(id);
    return { success: true, data: po };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm purchase order" };
  }
}

export async function cancelPurchaseOrderAction(id: string) {
  try {
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

export interface CreateVendorBillInput {
  vendorId: string;
  billDate: Date;
  dueDate: Date;
  createdById?: string;
  lines: {
    productId: string;
    analyticAccountId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function createStandaloneBillAction(input: CreateVendorBillInput) {
  try {
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

    const billNumber = `BILL-${Date.now()}`;

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorId: input.vendorId,
        billDate: input.billDate,
        dueDate: input.dueDate,
        status: DocumentStatus.DRAFT,
        total,
        amountPaid: 0,
        amountDue: total,
        createdById: input.createdById || "system",
        lines: {
          create: lineDatas,
        },
      },
      include: {
        vendor: true,
        lines: true,
      },
    });

    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create vendor bill" };
  }
}

export async function confirmBillAction(id: string) {
  try {
    const bill = await vendorBillService.confirm(id);
    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm bill" };
  }
}

export async function getPurchaseOrdersAction() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
      },
      orderBy: { orderDate: "desc" },
    });
    return { success: true, data: pos };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch purchase orders" };
  }
}

export async function getVendorBillsAction() {
  try {
    const bills = await prisma.vendorBill.findMany({
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
      },
      orderBy: { billDate: "desc" },
    });
    return { success: true, data: bills };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch vendor bills" };
  }
}

export async function getAnalyticAccountsAction() {
  try {
    const accounts = await prisma.analyticAccount.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: accounts };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch analytic accounts" };
  }
}
