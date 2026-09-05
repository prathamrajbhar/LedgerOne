import { DocumentStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

export interface SerializedBillLine {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
  } | null;
  analyticAccount?: {
    id: string;
    name: string;
  } | null;
}

export interface SerializedBillPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

export interface SerializedBillEmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  emailType: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  sentAt: string;
}

export interface SerializedBillData {
  id: string;
  billNumber: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  purchaseOrderId?: string | null;
  purchaseOrder?: {
    id: string;
    poNumber: string;
  } | null;
  billDate: string;
  dueDate: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  lastReminderSentAt?: string | null;
  reminderCount: number;
  lines: SerializedBillLine[];
  payments: SerializedBillPayment[];
  emailLogs: SerializedBillEmailLog[];
}

export function serializeBillData(raw: Record<string, unknown>): SerializedBillData {
  const vendor = (raw.vendor || {}) as Record<string, unknown>;
  const po = raw.purchaseOrder as Record<string, unknown> | null;
  const rawLines = (raw.lines || []) as Array<Record<string, unknown>>;
  const rawPayments = (raw.payments || []) as Array<Record<string, unknown>>;
  const rawLogs = (raw.emailLogs || []) as Array<Record<string, unknown>>;

  return {
    id: String(raw.id || ""),
    billNumber: String(raw.billNumber || ""),
    vendorId: String(raw.vendorId || ""),
    vendor: {
      id: String(vendor.id || ""),
      name: String(vendor.name || "Vendor"),
      email: (vendor.email as string) || null,
      phone: (vendor.phone as string) || null,
      address: (vendor.address as string) || null,
    },
    purchaseOrderId: (raw.purchaseOrderId as string) || null,
    purchaseOrder: po ? { id: String(po.id), poNumber: String(po.poNumber) } : null,
    billDate: new Date(raw.billDate as string | number | Date).toISOString(),
    dueDate: new Date(raw.dueDate as string | number | Date).toISOString(),
    status: raw.status as DocumentStatus,
    paymentStatus: raw.paymentStatus as PaymentStatus,
    total: Number(raw.total || 0),
    amountPaid: Number(raw.amountPaid || 0),
    amountDue: Number(raw.amountDue || 0),
    lastReminderSentAt: raw.lastReminderSentAt
      ? new Date(raw.lastReminderSentAt as string | number | Date).toISOString()
      : null,
    reminderCount: Number(raw.reminderCount || 0),
    lines: rawLines.map((l) => {
      const prod = l.product as Record<string, unknown> | null;
      const acc = l.analyticAccount as Record<string, unknown> | null;
      return {
        id: String(l.id || ""),
        quantity: Number(l.quantity || 0),
        unitPrice: Number(l.unitPrice || 0),
        lineTotal: Number(l.lineTotal || 0),
        product: prod
          ? {
              id: String(prod.id),
              name: String(prod.name),
              sku: (prod.sku as string) || null,
              category: (prod.category as string) || null,
            }
          : null,
        analyticAccount: acc
          ? { id: String(acc.id), name: String(acc.name) }
          : null,
      };
    }),
    payments: rawPayments.map((p) => ({
      id: String(p.id || ""),
      amount: Number(p.amount || 0),
      paymentDate: new Date(p.paymentDate as string | number | Date).toISOString(),
      paymentMethod: p.paymentMethod as PaymentMethod,
      note: (p.note as string) || null,
    })),
    emailLogs: rawLogs.map((log) => ({
      id: String(log.id || ""),
      recipientEmail: String(log.recipientEmail || ""),
      recipientName: (log.recipientName as string) || null,
      emailType: String(log.emailType || ""),
      subject: String(log.subject || ""),
      status: String(log.status || ""),
      errorMessage: (log.errorMessage as string) || null,
      sentAt: new Date(log.sentAt as string | number | Date).toISOString(),
    })),
  };
}
