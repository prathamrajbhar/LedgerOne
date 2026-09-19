export interface SerializedSalesOrderLine {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string | null;
  taxAmount: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  taxRate?: {
    id: string;
    name: string;
    percentage: number;
  } | null;
  analyticAccount?: {
    id: string;
    name: string;
  } | null;
}

export interface SerializedSalesOrderInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total?: number;
  amountPaid?: number;
  amountDue?: number;
  invoiceDate?: string;
}

export interface SerializedSalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  orderDate: string;
  deliveryDate?: string | null;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  total: number;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  lines: SerializedSalesOrderLine[];
  invoices: SerializedSalesOrderInvoice[];
}
