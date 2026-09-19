export interface SerializedPurchaseOrderLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  analyticAccount?: {
    id: string;
    name: string;
  } | null;
}

export interface SerializedPurchaseOrderBill {
  id: string;
  billNumber: string;
  status: string;
  total?: number;
  amountPaid?: number;
  amountDue?: number;
  billDate?: string;
}

export interface SerializedPurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  orderDate: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  total: number;
  vendor: {
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
  lines: SerializedPurchaseOrderLine[];
  vendorBills: SerializedPurchaseOrderBill[];
}
