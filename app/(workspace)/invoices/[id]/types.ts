import { DocumentStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

export interface SerializedInvoiceLine {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxAmount: number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
  taxRate?: {
    id: string;
    name: string;
    percentage: number;
  } | null;
}

export interface SerializedInvoicePayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

export interface SerializedInvoiceEmailLog {
  id: string;
  sentAt: string;
  recipientEmail: string;
  recipientName?: string | null;
  emailType: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
}

export interface SerializedInvoiceData {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  salesOrderId?: string | null;
  salesOrder?: {
    id: string;
    soNumber: string;
  } | null;
  invoiceDate: string;
  dueDate: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  lines: SerializedInvoiceLine[];
  payments: SerializedInvoicePayment[];
  emailLogs?: SerializedInvoiceEmailLog[];
}

export function serializeInvoiceData(
  rawInvoice: Record<string, unknown>
): SerializedInvoiceData {
  const customer = (rawInvoice.customer || {}) as Record<string, unknown>;
  const salesOrder = rawInvoice.salesOrder
    ? (rawInvoice.salesOrder as Record<string, unknown>)
    : null;
  const rawLines = Array.isArray(rawInvoice.lines) ? rawInvoice.lines : [];
  const rawPayments = Array.isArray(rawInvoice.payments)
    ? rawInvoice.payments
    : [];

  return {
    id: String(rawInvoice.id || ""),
    invoiceNumber: String(rawInvoice.invoiceNumber || ""),
    customerId: String(rawInvoice.customerId || ""),
    customer: {
      id: String(customer.id || ""),
      name: String(customer.name || "Unknown Customer"),
      email: customer.email ? String(customer.email) : null,
      phone: customer.phone ? String(customer.phone) : null,
      address: customer.address ? String(customer.address) : null,
    },
    salesOrderId: rawInvoice.salesOrderId
      ? String(rawInvoice.salesOrderId)
      : null,
    salesOrder: salesOrder
      ? {
          id: String(salesOrder.id || ""),
          soNumber: String(salesOrder.soNumber || ""),
        }
      : null,
    invoiceDate:
      rawInvoice.invoiceDate instanceof Date
        ? rawInvoice.invoiceDate.toISOString()
        : String(rawInvoice.invoiceDate || new Date().toISOString()),
    dueDate:
      rawInvoice.dueDate instanceof Date
        ? rawInvoice.dueDate.toISOString()
        : String(rawInvoice.dueDate || new Date().toISOString()),
    status: (rawInvoice.status as DocumentStatus) || DocumentStatus.DRAFT,
    paymentStatus:
      (rawInvoice.paymentStatus as PaymentStatus) || PaymentStatus.NOT_PAID,
    total: Number(rawInvoice.total || 0),
    amountPaid: Number(rawInvoice.amountPaid || 0),
    amountDue: Number(rawInvoice.amountDue || 0),
    lines: rawLines.map((rawLine: unknown) => {
      const line = rawLine as Record<string, unknown>;
      const product = line.product
        ? (line.product as Record<string, unknown>)
        : null;
      const taxRate = line.taxRate
        ? (line.taxRate as Record<string, unknown>)
        : null;

      return {
        id: String(line.id || ""),
        quantity: Number(line.quantity || 0),
        unitPrice: Number(line.unitPrice || 0),
        lineTotal: Number(line.lineTotal || 0),
        taxAmount: Number(line.taxAmount || 0),
        product: product
          ? {
              id: String(product.id || ""),
              name: String(product.name || ""),
              sku: product.sku ? String(product.sku) : null,
            }
          : null,
        taxRate: taxRate
          ? {
              id: String(taxRate.id || ""),
              name: String(taxRate.name || ""),
              percentage: Number(taxRate.percentage || 0),
            }
          : null,
      };
    }),
    payments: rawPayments.map((rawPayment: unknown) => {
      const payment = rawPayment as Record<string, unknown>;
      return {
        id: String(payment.id || ""),
        amount: Number(payment.amount || 0),
        paymentDate:
          payment.paymentDate instanceof Date
            ? payment.paymentDate.toISOString()
            : String(payment.paymentDate || ""),
        paymentMethod:
          (payment.paymentMethod as PaymentMethod) || PaymentMethod.BANK,
        note: payment.note ? String(payment.note) : null,
      };
    }),
    emailLogs: Array.isArray(rawInvoice.emailLogs)
      ? rawInvoice.emailLogs.map((rawLog: unknown) => {
          const log = rawLog as Record<string, unknown>;
          return {
            id: String(log.id || ""),
            sentAt:
              log.sentAt instanceof Date
                ? log.sentAt.toISOString()
                : String(log.sentAt || ""),
            recipientEmail: String(log.recipientEmail || ""),
            recipientName: log.recipientName ? String(log.recipientName) : null,
            emailType: String(log.emailType || ""),
            subject: String(log.subject || ""),
            status: String(log.status || ""),
            errorMessage: log.errorMessage ? String(log.errorMessage) : null,
          };
        })
      : [],
  };
}
