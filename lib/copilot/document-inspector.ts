import { prisma } from "@/lib/prisma";

export async function inspectERPDocument(identifier: string) {
  const clean = identifier.trim();

  // 1. Customer Invoice
  const invoice = await prisma.customerInvoice.findFirst({
    where: { OR: [{ id: clean }, { invoiceNumber: clean }] },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      lines: {
        include: { product: { select: { name: true, sku: true } } },
      },
      payments: { select: { id: true, amount: true, paymentDate: true, paymentMethod: true } },
    },
  });

  if (invoice) {
    return {
      documentType: "CUSTOMER_INVOICE",
      id: invoice.id,
      documentNumber: invoice.invoiceNumber,
      contactName: invoice.customer.name,
      contactEmail: invoice.customer.email,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
      date: invoice.invoiceDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
      lines: invoice.lines.map((l) => ({
        productName: l.product.name,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineTotal: Number(l.lineTotal),
      })),
      paymentsCount: invoice.payments.length,
    };
  }

  // 2. Vendor Bill
  const bill = await prisma.vendorBill.findFirst({
    where: { OR: [{ id: clean }, { billNumber: clean }] },
    include: {
      vendor: { select: { name: true, email: true, phone: true } },
      lines: {
        include: { product: { select: { name: true, sku: true } } },
      },
      payments: { select: { id: true, amount: true, paymentDate: true, paymentMethod: true } },
    },
  });

  if (bill) {
    return {
      documentType: "VENDOR_BILL",
      id: bill.id,
      documentNumber: bill.billNumber,
      contactName: bill.vendor.name,
      contactEmail: bill.vendor.email,
      status: bill.status,
      paymentStatus: bill.paymentStatus,
      date: bill.billDate.toISOString().split("T")[0],
      dueDate: bill.dueDate.toISOString().split("T")[0],
      total: Number(bill.total),
      amountPaid: Number(bill.amountPaid),
      amountDue: Number(bill.amountDue),
      lines: bill.lines.map((l) => ({
        productName: l.product.name,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineTotal: Number(l.lineTotal),
      })),
      paymentsCount: bill.payments.length,
    };
  }

  // 3. Sales Order
  const salesOrder = await prisma.salesOrder.findFirst({
    where: { OR: [{ id: clean }, { soNumber: clean }] },
    include: {
      customer: { select: { name: true, email: true } },
      lines: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (salesOrder) {
    return {
      documentType: "SALES_ORDER",
      id: salesOrder.id,
      documentNumber: salesOrder.soNumber,
      contactName: salesOrder.customer.name,
      contactEmail: salesOrder.customer.email,
      status: salesOrder.status,
      date: salesOrder.orderDate.toISOString().split("T")[0],
      total: Number(salesOrder.total),
      lines: salesOrder.lines.map((l) => ({
        productName: l.product.name,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineTotal: Number(l.lineTotal),
      })),
    };
  }

  // 4. Purchase Order
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { OR: [{ id: clean }, { poNumber: clean }] },
    include: {
      vendor: { select: { name: true, email: true } },
      lines: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (purchaseOrder) {
    return {
      documentType: "PURCHASE_ORDER",
      id: purchaseOrder.id,
      documentNumber: purchaseOrder.poNumber,
      contactName: purchaseOrder.vendor.name,
      contactEmail: purchaseOrder.vendor.email,
      status: purchaseOrder.status,
      date: purchaseOrder.orderDate.toISOString().split("T")[0],
      total: Number(purchaseOrder.total),
      lines: purchaseOrder.lines.map((l) => ({
        productName: l.product.name,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineTotal: Number(l.lineTotal),
      })),
    };
  }

  return null;
}
