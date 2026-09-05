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
}

export const contactService = new ContactService();
