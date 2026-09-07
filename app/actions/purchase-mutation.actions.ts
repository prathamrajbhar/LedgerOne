"use server";

import { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { requirePermission } from "@/lib/auth/guard";

export interface CreateVendorBillInput {
  vendorId: string;
  purchaseOrderId?: string;
  billDate: Date;
  dueDate: Date;
  billNumber?: string;
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

    let billNumber = input.billNumber?.trim();
    if (billNumber) {
      const existing = await prisma.vendorBill.findUnique({ where: { billNumber } });
      if (existing) {
        billNumber = `${billNumber}-${Date.now().toString().slice(-4)}`;
      }
    } else {
      billNumber = `BILL-${Date.now()}`;
    }

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorId: input.vendorId,
        purchaseOrderId: input.purchaseOrderId || null,
        billDate: input.billDate,
        dueDate: input.dueDate,
        status: DocumentStatus.DRAFT,
        total,
        amountPaid: 0,
        amountDue: total,
        createdById: user.id,
        lines: { create: lineDatas },
      },
      include: { vendor: true, lines: true },
    });

    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create vendor bill" };
  }
}

export async function confirmBillAction(id: string) {
  try {
    await requirePermission("purchase:confirm");
    const bill = await vendorBillService.confirm(id);
    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm bill" };
  }
}

export async function cancelBillAction(id: string) {
  try {
    await requirePermission("purchase:cancel");
    const bill = await vendorBillService.cancel(id);
    return { success: true, data: bill };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel bill" };
  }
}
