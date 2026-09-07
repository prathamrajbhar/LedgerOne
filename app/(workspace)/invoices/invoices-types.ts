import { PaymentMethod, Prisma, CustomerInvoice, Contact, Product } from "@prisma/client";

export interface InvoiceLineItem {
  id: string;
  productId: string;
  quantity: Prisma.Decimal | number;
  unitPrice: Prisma.Decimal | number;
  lineTotal: Prisma.Decimal | number;
  taxAmount: Prisma.Decimal | number;
  taxRateId?: string | null;
  product: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
  };
  taxRate?: {
    id: string;
    name: string;
    percentage: Prisma.Decimal | number;
  } | null;
}

export interface InvoicePaymentItem {
  id: string;
  amount: Prisma.Decimal | number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

export interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  salesOrder?: {
    id: string;
    soNumber: string;
  } | null;
  lines: InvoiceLineItem[];
  payments: InvoicePaymentItem[];
}

export interface FormLineRow {
  productId: string;
  description: string;
  quantity: number | "";
  unitPrice: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

export interface InvoiceSummaryMetrics {
  totalCount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
}

export interface InvoicesClientProps {
  invoices: InvoiceWithRelations[];
  customers: Contact[];
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  salesOrders: Array<{ id: string; soNumber: string; customerId: string }>;
}
