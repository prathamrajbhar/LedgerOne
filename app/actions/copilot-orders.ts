"use server";

import { prisma } from "@/lib/prisma";
import { salesOrderService } from "@/lib/services/sales-order.service";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { ContactType, DocumentStatus, ProductType } from "@prisma/client";
import { CopilotActionResult } from "./copilot.actions";

export async function handleCreateSalesOrder(
  input: Record<string, unknown>,
  userId: string
): Promise<CopilotActionResult> {
  try {
    const custName = String(input.customerName || "").trim();
    const prodName = String(input.productName || "").trim();
    const quantity = Math.max(1, Number(input.quantity || 1));
    const unitPrice = Math.max(0, Number(input.unitPrice || 0));

    if (!custName || !prodName) return { success: false, error: "Customer and product name are required." };

    let customer = await prisma.contact.findFirst({
      where: { name: { contains: custName, mode: "insensitive" }, type: { in: [ContactType.CUSTOMER, ContactType.BOTH] } },
    });
    if (!customer) {
      customer = await prisma.contact.create({
        data: { name: custName, email: `${custName.toLowerCase().replace(/\s+/g, ".")}@example.com`, type: ContactType.CUSTOMER },
      });
    }

    let product = await prisma.product.findFirst({
      where: { name: { contains: prodName, mode: "insensitive" }, isArchived: false },
    });
    if (!product) {
      const category = await prisma.productCategory.findFirst() || await prisma.productCategory.create({ data: { name: "General Goods" } });
      product = await prisma.product.create({
        data: { name: prodName, type: ProductType.GOODS, categoryId: category.id, salesPrice: unitPrice || 1000, cost: (unitPrice || 1000) * 0.7, stock: 10 },
      });
    }

    const analytic = await prisma.analyticAccount.findFirst();
    const order = await salesOrderService.create({
      customerId: customer.id,
      orderDate: new Date(),
      createdById: userId,
      lines: [{ productId: product.id, description: `${product.name} - Quotation`, quantity, unitPrice: unitPrice || Number(product.salesPrice), analyticAccountId: analytic?.id }],
    });

    return {
      success: true,
      action: "createSalesOrderAction",
      message: `Sales Order ${order.soNumber} created for ${customer.name} (Total: ₹${Number(order.total).toLocaleString("en-IN")}).`,
      orderNumber: order.soNumber,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to create sales order." };
  }
}

export async function handleConfirmSalesOrder(input: Record<string, unknown>): Promise<CopilotActionResult> {
  try {
    const num = String(input.orderNumber || "").trim();
    if (!num) return { success: false, error: "Sales Order number or ID is required." };
    const so = await prisma.salesOrder.findFirst({ where: { OR: [{ id: num }, { soNumber: num }] } });
    if (!so) return { success: false, error: `Sales Order '${num}' not found.` };
    if (so.status === DocumentStatus.CONFIRMED) return { success: true, message: `Sales Order ${so.soNumber} is already confirmed.` };

    const confirmed = await salesOrderService.confirm({ id: so.id });
    return { success: true, action: "confirmSalesOrderAction", message: `Sales Order ${confirmed.soNumber} officially confirmed.`, orderNumber: confirmed.soNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to confirm sales order." };
  }
}

export async function handleConvertSalesOrderToInvoice(
  input: Record<string, unknown>,
  userId: string
): Promise<CopilotActionResult> {
  try {
    const num = String(input.orderNumber || "").trim();
    if (!num) return { success: false, error: "Sales Order number or ID is required." };
    const so = await prisma.salesOrder.findFirst({ where: { OR: [{ id: num }, { soNumber: num }] } });
    if (!so) return { success: false, error: `Sales Order '${num}' not found.` };

    if (so.status !== DocumentStatus.CONFIRMED) await salesOrderService.confirm({ id: so.id });
    const invoice = await customerInvoiceService.createFromSalesOrder(so.id, new Date(), new Date(Date.now() + 30 * 86400000), userId);

    return {
      success: true,
      action: "convertSalesOrderToInvoiceAction",
      message: `Invoice ${invoice.invoiceNumber} generated from Sales Order ${so.soNumber}.`,
      invoiceNumber: invoice.invoiceNumber,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to convert sales order to invoice." };
  }
}

export async function handleCreatePurchaseOrder(
  input: Record<string, unknown>,
  userId: string
): Promise<CopilotActionResult> {
  try {
    const vName = String(input.vendorName || "").trim();
    const pName = String(input.productName || "").trim();
    const quantity = Math.max(1, Number(input.quantity || 1));
    const unitPrice = Math.max(0, Number(input.unitPrice || 0));

    if (!vName || !pName) return { success: false, error: "Vendor and product name are required." };

    let vendor = await prisma.contact.findFirst({
      where: { name: { contains: vName, mode: "insensitive" }, type: { in: [ContactType.VENDOR, ContactType.BOTH] } },
    });
    if (!vendor) {
      vendor = await prisma.contact.create({
        data: { name: vName, email: `${vName.toLowerCase().replace(/\s+/g, ".")}@vendor.com`, type: ContactType.VENDOR },
      });
    }

    let product = await prisma.product.findFirst({
      where: { name: { contains: pName, mode: "insensitive" }, isArchived: false },
    });
    if (!product) {
      const category = await prisma.productCategory.findFirst() || await prisma.productCategory.create({ data: { name: "Raw Materials" } });
      product = await prisma.product.create({
        data: { name: pName, type: ProductType.GOODS, categoryId: category.id, salesPrice: (unitPrice || 500) * 1.5, cost: unitPrice || 500, stock: 0 },
      });
    }

    const analytic = await prisma.analyticAccount.findFirst();
    if (!analytic) return { success: false, error: "No analytic account found for purchase tracking." };

    const po = await purchaseOrderService.create({
      vendorId: vendor.id,
      orderDate: new Date(),
      createdById: userId,
      lines: [{ productId: product.id, analyticAccountId: analytic.id, quantity, unitPrice: unitPrice || Number(product.cost) }],
    });

    return {
      success: true,
      action: "createPurchaseOrderAction",
      message: `Purchase Order ${po.poNumber} created for ${vendor.name} (Total: ₹${Number(po.total).toLocaleString("en-IN")}).`,
      orderNumber: po.poNumber,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to create purchase order." };
  }
}

export async function handleConfirmPurchaseOrder(input: Record<string, unknown>): Promise<CopilotActionResult> {
  try {
    const num = String(input.orderNumber || "").trim();
    if (!num) return { success: false, error: "Purchase Order number or ID is required." };
    const po = await prisma.purchaseOrder.findFirst({ where: { OR: [{ id: num }, { poNumber: num }] } });
    if (!po) return { success: false, error: `Purchase Order '${num}' not found.` };
    if (po.status === DocumentStatus.CONFIRMED) return { success: true, message: `Purchase Order ${po.poNumber} is already confirmed.` };

    const confirmed = await purchaseOrderService.confirm(po.id);
    return { success: true, action: "confirmPurchaseOrderAction", message: `Purchase Order ${confirmed.poNumber} officially confirmed.`, orderNumber: confirmed.poNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to confirm purchase order." };
  }
}

export async function handleConvertPurchaseOrderToBill(
  input: Record<string, unknown>,
  userId: string
): Promise<CopilotActionResult> {
  try {
    const num = String(input.orderNumber || "").trim();
    if (!num) return { success: false, error: "Purchase Order number or ID is required." };
    const po = await prisma.purchaseOrder.findFirst({ where: { OR: [{ id: num }, { poNumber: num }] } });
    if (!po) return { success: false, error: `Purchase Order '${num}' not found.` };

    if (po.status !== DocumentStatus.CONFIRMED) await purchaseOrderService.confirm(po.id);
    const bill = await vendorBillService.createFromPurchaseOrder(po.id, userId);

    return {
      success: true,
      action: "convertPurchaseOrderToBillAction",
      message: `Vendor Bill ${bill.billNumber} generated from Purchase Order ${po.poNumber}.`,
      billNumber: bill.billNumber,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to convert purchase order to bill." };
  }
}
