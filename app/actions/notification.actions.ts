"use server";

import { prisma } from "@/lib/prisma";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth/session";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "ALERT" | "STOCK" | "PAYMENT";
  link: string;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export async function getSystemNotificationsAction(): Promise<{
  success: boolean;
  data?: SystemNotification[];
  error?: string;
}> {
  try {
    await requireAuth();

    const [overdueInvoices, alertedProducts, pendingBills] = await Promise.all([
      // Overdue customer invoices
      prisma.customerInvoice.findMany({
        where: {
          status: DocumentStatus.CONFIRMED,
          paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
          dueDate: { lt: new Date() },
        },
        include: { customer: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),

      // Products at or below reorder point
      prisma.product.findMany({
        where: { isArchived: false },
        include: { category: true },
        orderBy: { stock: "asc" },
      }),

      // Vendor bills pending settlement
      prisma.vendorBill.findMany({
        where: {
          status: DocumentStatus.CONFIRMED,
          paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        },
        include: { vendor: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    const notifications: SystemNotification[] = [];

    // 1. Process Overdue Invoices
    for (const inv of overdueInvoices) {
      notifications.push({
        id: `inv-${inv.id}`,
        title: `Invoice Overdue: ${inv.invoiceNumber}`,
        description: `${inv.customer.name} invoice for ₹${Number(inv.amountDue).toLocaleString("en-IN")} passed due date (${new Date(inv.dueDate).toLocaleDateString("en-IN")}).`,
        time: formatRelativeTime(inv.dueDate),
        type: "ALERT",
        link: `/invoices/${inv.id}`,
      });
    }

    // 2. Process Low / Out of Stock
    const lowStock = alertedProducts.filter((p) => p.stock <= p.reorderPoint).slice(0, 5);
    for (const p of lowStock) {
      const isOut = p.stock === 0;
      notifications.push({
        id: `prod-${p.id}`,
        title: isOut ? `Critical Stockout: ${p.name}` : `Low Stock Alert: ${p.name}`,
        description: isOut
          ? `${p.name} (${p.sku || p.category.name}) is completely out of stock.`
          : `${p.name} has ${p.stock} units remaining (Safety reorder threshold: ${p.reorderPoint}).`,
        time: formatRelativeTime(p.updatedAt),
        type: "STOCK",
        link: `/products/${p.id}`,
      });
    }

    // 3. Process Vendor Bills Due
    for (const bill of pendingBills) {
      const isPastDue = new Date(bill.dueDate) < new Date();
      notifications.push({
        id: `bill-${bill.id}`,
        title: isPastDue ? `Vendor Bill Overdue: ${bill.billNumber}` : `Vendor Bill Due: ${bill.billNumber}`,
        description: `Disbursement to ${bill.vendor.name} for ₹${Number(bill.amountDue).toLocaleString("en-IN")} due on ${new Date(bill.dueDate).toLocaleDateString("en-IN")}.`,
        time: formatRelativeTime(bill.dueDate),
        type: "PAYMENT",
        link: `/bills/${bill.id}`,
      });
    }

    return { success: true, data: notifications };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to load notifications" };
  }
}
