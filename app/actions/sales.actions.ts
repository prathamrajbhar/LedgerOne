"use server";

import { salesOrderService, CreateSalesOrderInput, ListSalesOrdersParams } from "@/lib/services/sales-order.service";
import { customerInvoiceService, CreateStandaloneInvoiceInput, ListCustomerInvoicesParams } from "@/lib/services/customer-invoice.service";
import { DocumentStatus, PaymentStatus } from "@prisma/client";

export async function getSalesOrdersAction(params?: ListSalesOrdersParams) {
  try {
    const result = await salesOrderService.list(params || {});
    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch sales orders" };
  }
}

export async function createSalesOrderAction(input: CreateSalesOrderInput) {
  try {
    const salesOrder = await salesOrderService.create(input);
    return { success: true, data: salesOrder };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create sales order" };
  }
}

export async function confirmSalesOrderAction(id: string) {
  try {
    const salesOrder = await salesOrderService.confirm({ id });
    return { success: true, data: salesOrder };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm sales order" };
  }
}

export async function cancelSalesOrderAction(id: string) {
  try {
    const salesOrder = await salesOrderService.cancel(id);
    return { success: true, data: salesOrder };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel sales order" };
  }
}

export async function createInvoiceFromSalesOrderAction(salesOrderId: string, invoiceDate?: Date, dueDate?: Date, userId?: string) {
  try {
    const invoice = await customerInvoiceService.createFromSalesOrder(salesOrderId, invoiceDate, dueDate, userId);
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create invoice from sales order" };
  }
}

export async function createStandaloneInvoiceAction(input: CreateStandaloneInvoiceInput) {
  try {
    const invoice = await customerInvoiceService.createStandalone(input);
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create standalone invoice" };
  }
}

export async function confirmInvoiceAction(id: string, userId?: string) {
  try {
    const invoice = await customerInvoiceService.confirm(id, userId);
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to confirm invoice" };
  }
}

export async function cancelInvoiceAction(id: string) {
  try {
    const invoice = await customerInvoiceService.cancel(id);
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to cancel invoice" };
  }
}

export async function getInvoicesAction(params?: {
  customerId?: string;
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  try {
    const listParams: ListCustomerInvoicesParams = {
      customerId: params?.customerId,
      status: params?.status,
      paymentStatus: params?.paymentStatus,
      startDate: params?.startDate,
      endDate: params?.endDate,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };

    const result = await customerInvoiceService.list(listParams);
    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch invoices" };
  }
}

export async function getInvoiceByIdAction(id: string) {
  try {
    const invoice = await customerInvoiceService.findById(id);
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch invoice" };
  }
}

export async function downloadInvoicePDFAction(invoiceId: string) {
  try {
    const invoice = await customerInvoiceService.findById(invoiceId);
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }
    return { success: true, data: invoice };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to download invoice" };
  }
}
