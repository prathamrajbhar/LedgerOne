"use server";

import { salesOrderService, CreateSalesOrderInput } from "@/lib/services/sales-order.service";
import { customerInvoiceService, CreateStandaloneInvoiceInput } from "@/lib/services/customer-invoice.service";

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
