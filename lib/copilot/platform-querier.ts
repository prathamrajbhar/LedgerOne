import { prisma } from "@/lib/prisma";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import { PlatformCategory } from "./types";

interface PlatformQueryParams {
  category: PlatformCategory;
  search?: string;
  status?: string;
  paymentStatus?: string;
  limit?: number;
}

export async function executePlatformQuery({
  category,
  search,
  status,
  paymentStatus,
  limit = 5,
}: PlatformQueryParams) {
  const clean = search?.trim() || "";

  if (category === "BILLS") {
    const where: Record<string, unknown> = {};
    if (status) where.status = status as DocumentStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
    if (clean) {
      where.OR = [
        { billNumber: { contains: clean, mode: "insensitive" } },
        { vendor: { name: { contains: clean, mode: "insensitive" } } },
      ];
    }

    const [totalCount, bills] = await Promise.all([
      prisma.vendorBill.count({ where }),
      prisma.vendorBill.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          billNumber: true,
          total: true,
          amountDue: true,
          status: true,
          paymentStatus: true,
          dueDate: true,
          vendor: { select: { name: true } },
        },
      }),
    ]);

    return {
      category,
      totalCount,
      records: bills.map((b) => ({
        id: b.id,
        billNumber: b.billNumber,
        vendor: b.vendor.name,
        total: Number(b.total),
        amountDue: Number(b.amountDue),
        status: `${b.status} (${b.paymentStatus})`,
        dueDate: b.dueDate.toISOString().split("T")[0],
      })),
    };
  }

  if (category === "INVOICES") {
    const where: Record<string, unknown> = {};
    if (status) where.status = status as DocumentStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
    if (clean) {
      where.OR = [
        { invoiceNumber: { contains: clean, mode: "insensitive" } },
        { customer: { name: { contains: clean, mode: "insensitive" } } },
      ];
    }

    const [totalCount, invoices] = await Promise.all([
      prisma.customerInvoice.count({ where }),
      prisma.customerInvoice.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          amountDue: true,
          status: true,
          paymentStatus: true,
          dueDate: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    return {
      category,
      totalCount,
      records: invoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        customer: i.customer.name,
        total: Number(i.total),
        amountDue: Number(i.amountDue),
        status: `${i.status} (${i.paymentStatus})`,
        dueDate: i.dueDate.toISOString().split("T")[0],
      })),
    };
  }

  if (category === "PRODUCTS") {
    const where: Record<string, unknown> = { isArchived: false };
    if (clean) {
      where.OR = [
        { name: { contains: clean, mode: "insensitive" } },
        { sku: { contains: clean, mode: "insensitive" } },
      ];
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        take: limit,
        select: { id: true, name: true, sku: true, stock: true, salesPrice: true, reorderPoint: true },
      }),
    ]);

    return {
      category,
      totalCount,
      records: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        salesPrice: Number(p.salesPrice),
        status: p.stock === 0 ? "OUT_OF_STOCK" : p.stock <= p.reorderPoint ? "LOW_STOCK" : "IN_STOCK",
      })),
    };
  }

  if (category === "CONTACTS") {
    const where: Record<string, unknown> = { isArchived: false };
    if (clean) {
      where.OR = [
        { name: { contains: clean, mode: "insensitive" } },
        { email: { contains: clean, mode: "insensitive" } },
      ];
    }

    const [totalCount, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        take: limit,
        select: { id: true, name: true, email: true, type: true, phone: true },
      }),
    ]);

    return {
      category,
      totalCount,
      records: contacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        type: c.type,
        phone: c.phone,
      })),
    };
  }

  return { category, totalCount: 0, records: [] };
}
