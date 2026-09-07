import {
  DocumentStatus,
  PaymentStatus,
  PaymentMethod,
  Prisma,
  Contact,
} from "@prisma/client";

export interface BillLineItem {
  id: string;
  productId: string;
  analyticAccountId: string;
  quantity: Prisma.Decimal | number;
  unitPrice: Prisma.Decimal | number;
  lineTotal: Prisma.Decimal | number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
    unitOfMeasure?: string | null;
  } | null;
  analyticAccount?: {
    id: string;
    name: string;
    code?: string;
  } | null;
}

export interface BillPaymentItem {
  id: string;
  amount: Prisma.Decimal | number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

export interface BillEmailLogItem {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  emailType: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  sentAt: string | Date;
}

export interface VendorBillWithRelations {
  id: string;
  billNumber: string;
  vendorId: string;
  vendor: Contact;
  purchaseOrderId?: string | null;
  purchaseOrder?: {
    id: string;
    poNumber: string;
  } | null;
  billDate: Date | string;
  dueDate: Date | string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  total: Prisma.Decimal | number;
  amountPaid: Prisma.Decimal | number;
  amountDue: Prisma.Decimal | number;
  lastReminderSentAt?: Date | string | null;
  reminderCount?: number;
  lines: BillLineItem[];
  payments?: BillPaymentItem[];
  emailLogs?: BillEmailLogItem[];
}

export interface FormBillLineRow {
  productId: string;
  analyticAccountId: string;
  description: string;
  quantity: number | "";
  unit: string;
  unitCost: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

export interface BillSummaryMetrics {
  totalCount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
}
