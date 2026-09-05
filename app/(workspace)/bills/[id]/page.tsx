import * as React from "react";
import { notFound } from "next/navigation";
import { getVendorBillByIdAction } from "@/app/actions/purchase.actions";
import { BillDetailClient, SerializedBillData } from "./bill-detail-client";

export default async function VendorBillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getVendorBillByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Serialize Prisma Decimals and Dates cleanly for Client Component
  const rawBill = result.data as any;
  const bill: SerializedBillData = {
    id: rawBill.id,
    billNumber: rawBill.billNumber,
    vendorId: rawBill.vendorId,
    vendor: {
      id: rawBill.vendor.id,
      name: rawBill.vendor.name,
      email: rawBill.vendor.email,
      phone: rawBill.vendor.phone,
      address: rawBill.vendor.address,
    },
    purchaseOrderId: rawBill.purchaseOrderId,
    purchaseOrder: rawBill.purchaseOrder
      ? {
          id: rawBill.purchaseOrder.id,
          poNumber: rawBill.purchaseOrder.poNumber,
        }
      : null,
    billDate: new Date(rawBill.billDate).toISOString(),
    dueDate: new Date(rawBill.dueDate).toISOString(),
    status: rawBill.status,
    paymentStatus: rawBill.paymentStatus,
    total: Number(rawBill.total),
    amountPaid: Number(rawBill.amountPaid),
    amountDue: Number(rawBill.amountDue),
    lastReminderSentAt: rawBill.lastReminderSentAt
      ? new Date(rawBill.lastReminderSentAt).toISOString()
      : null,
    reminderCount: rawBill.reminderCount || 0,
    lines: (rawBill.lines || []).map((l: any) => ({
      id: l.id,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      lineTotal: Number(l.lineTotal),
      product: l.product
        ? {
            id: l.product.id,
            name: l.product.name,
            sku: l.product.sku,
            category: l.product.category,
          }
        : null,
      analyticAccount: l.analyticAccount
        ? {
            id: l.analyticAccount.id,
            name: l.analyticAccount.name,
          }
        : null,
    })),
    payments: (rawBill.payments || []).map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: new Date(p.paymentDate).toISOString(),
      paymentMethod: p.paymentMethod,
      note: p.note,
    })),
    emailLogs: (rawBill.emailLogs || []).map((log: any) => ({
      id: log.id,
      recipientEmail: log.recipientEmail,
      recipientName: log.recipientName,
      emailType: log.emailType,
      subject: log.subject,
      status: log.status,
      errorMessage: log.errorMessage,
      sentAt: new Date(log.sentAt).toISOString(),
    })),
  };

  return <BillDetailClient initialBill={bill} />;
}
