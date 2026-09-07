"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guard";

export async function getPurchaseOrdersAction() {
  try {
    await requirePermission("purchase:read");
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        vendorBills: {
          select: {
            id: true,
            billNumber: true,
            status: true,
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
    await requirePermission("purchase:read");
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
        payments: {
          orderBy: {
            paymentDate: "desc",
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

export async function getVendorBillByIdAction(id: string) {
  try {
    await requirePermission(["purchase:read", "portal:read"]);
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    if (!bill) {
      return { success: false, error: "Vendor bill not found" };
    }

    let emailLogs: unknown[] = [];
    try {
      emailLogs = await prisma.billEmailLog.findMany({
        where: { vendorBillId: id },
        orderBy: { sentAt: "desc" },
      });
    } catch {
      emailLogs = [];
    }

    return { success: true, data: { ...bill, emailLogs } };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch vendor bill details" };
  }
}
