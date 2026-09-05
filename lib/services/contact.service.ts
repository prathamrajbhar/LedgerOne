import { prisma } from "@/lib/prisma";
/**
 * Contact Service
 * Manages customer and vendor contact information
 */

import { ContactType, Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "../utils/errors";



export interface CreateContactInput {
  name: string;
  type: ContactType;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
}

export interface ListContactsParams {
  search?: string;
  type?: ContactType;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export class ContactService {
  async create(input: CreateContactInput) {
    // Validate email uniqueness
    const existing = await prisma.contact.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const contact = await prisma.contact.create({
      data: input,
    });

    return contact;
  }

  async update(input: UpdateContactInput) {
    const { id, ...data } = input;

    // Check if contact exists
    const existing = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Contact not found");
    }

    // If email is being updated, check uniqueness
    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.contact.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new ConflictError("Email already exists");
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    return contact;
  }

  async findById(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            isActive: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError("Contact not found");
    }

    return contact;
  }

  async list(params: ListContactsParams) {
    const { search, type, isArchived = false, limit = 25, offset = 0 } = params;

    const where: Prisma.ContactWhereInput = {
      isArchived,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: "asc" },
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      total,
      limit,
      offset,
    };
  }

  async archive(id: string) {
    const contact = await prisma.contact.update({
      where: { id },
      data: { isArchived: true },
    });

    return contact;
  }

  async restore(id: string) {
    const contact = await prisma.contact.update({
      where: { id },
      data: { isArchived: false },
    });

    return contact;
  }

  /**
   * Check if contact can be hard deleted (Admin only, no transactions)
   */
  async canDelete(id: string): Promise<boolean> {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        purchaseOrders: { take: 1 },
        vendorBills: { take: 1 },
        salesOrders: { take: 1 },
        customerInvoices: { take: 1 },
      },
    });

    if (!contact) {
      return false;
    }

    return (
      contact.purchaseOrders.length === 0 &&
      contact.vendorBills.length === 0 &&
      contact.salesOrders.length === 0 &&
      contact.customerInvoices.length === 0
    );
  }

  async getUsageDetails(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        salesOrders: { take: 10, orderBy: { orderDate: "desc" } },
        customerInvoices: { take: 10, orderBy: { invoiceDate: "desc" } },
        vendorBills: { take: 10, orderBy: { billDate: "desc" } },
        purchaseOrders: { take: 10, orderBy: { orderDate: "desc" } },
      },
    });

    if (!contact) {
      return {
        canDelete: true,
        totalReferences: 0,
        breakdown: {
          salesOrders: 0,
          invoices: 0,
          vendorBills: 0,
          purchaseOrders: 0,
        },
        dependencies: [],
      };
    }

    const dependencies = [
      ...contact.salesOrders.map((so) => ({
        id: so.id,
        type: "SALES_ORDER" as const,
        typeName: "Sales Order",
        reference: so.soNumber,
        date: so.orderDate.toISOString(),
        status: so.status,
        amount: Number(so.total),
        viewUrl: "/sales",
        canDeleteDirectly: so.status !== "CONFIRMED",
      })),
      ...contact.customerInvoices.map((inv) => ({
        id: inv.id,
        type: "CUSTOMER_INVOICE" as const,
        typeName: "Customer Invoice",
        reference: inv.invoiceNumber,
        date: inv.invoiceDate.toISOString(),
        status: inv.status,
        amount: Number(inv.total),
        viewUrl: "/invoices",
        canDeleteDirectly: inv.status === "DRAFT" || inv.status === "CANCELLED",
      })),
      ...contact.vendorBills.map((bill) => ({
        id: bill.id,
        type: "VENDOR_BILL" as const,
        typeName: "Vendor Bill",
        reference: bill.billNumber,
        date: bill.billDate.toISOString(),
        status: bill.status,
        amount: Number(bill.total),
        viewUrl: "/bills",
        canDeleteDirectly: bill.status === "DRAFT" || bill.status === "CANCELLED",
      })),
      ...contact.purchaseOrders.map((po) => ({
        id: po.id,
        type: "PURCHASE_ORDER" as const,
        typeName: "Purchase Order",
        reference: po.poNumber,
        date: po.orderDate.toISOString(),
        status: po.status,
        amount: Number(po.total),
        viewUrl: "/purchases",
        canDeleteDirectly: po.status !== "CONFIRMED",
      })),
    ];

    return {
      canDelete: dependencies.length === 0,
      totalReferences: dependencies.length,
      breakdown: {
        salesOrders: contact.salesOrders.length,
        invoices: contact.customerInvoices.length,
        vendorBills: contact.vendorBills.length,
        purchaseOrders: contact.purchaseOrders.length,
      },
      dependencies,
    };
  }

  async deleteDependency(type: string, id: string) {
    if (type === "SALES_ORDER") {
      await prisma.salesOrder.delete({ where: { id } });
    } else if (type === "CUSTOMER_INVOICE") {
      await prisma.customerInvoice.delete({ where: { id } });
    } else if (type === "VENDOR_BILL") {
      await prisma.vendorBill.delete({ where: { id } });
    } else if (type === "PURCHASE_ORDER") {
      await prisma.purchaseOrder.delete({ where: { id } });
    }
  }
}

export const contactService = new ContactService();
