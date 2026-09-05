/**
 * Customer Invoice Service
 * Manages customer invoices, payments, and portal invoice listings
 */

import {
  PrismaClient,
  DocumentStatus,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CustomerInvoiceLineInput {
  productId: string;
  analyticAccountId?: string;
  taxRateId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateCustomerInvoiceInput {
  customerId: string;
  invoiceDate: Date | string;
  dueDate: Date | string;
  salesOrderId?: string;
  invoiceReference?: string;
  lines: CustomerInvoiceLineInput[];
  userId?: string;
}

export interface RecordInvoicePaymentInput {
  invoiceId: string;
  amount: number | Decimal;
  paymentMethod: PaymentMethod;
  paymentDate?: Date | string;
  note?: string;
  userId?: string;
}

export interface ListCustomerInvoicesParams {
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class CustomerInvoiceService {
  async list(params: ListCustomerInvoicesParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
    if (params.customerId) where.customerId = params.customerId;

    const [data, total] = await Promise.all([
      prisma.customerInvoice.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          salesOrder: { select: { id: true, soNumber: true } },
          lines: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customerInvoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Strictly isolated query for customer portal
   */
  async listForContact(contactId: string) {
    if (!contactId) {
      throw new ValidationError("Contact ID is required");
    }

    return prisma.customerInvoice.findMany({
      where: { customerId: contactId },
      include: {
        lines: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrder: true,
        createdBy: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: true,
            analyticAccount: true,
            taxRate: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    return invoice;
  }

  async create(input: CreateCustomerInvoiceInput) {
    if (!input.customerId) throw new ValidationError("Customer is required");
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    let userId = input.userId;
    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) throw new ValidationError("No registered user found");
      userId = user.id;
    }

    let defaultIncomeAccount = await prisma.analyticAccount.findFirst({
      where: { type: "INCOME" },
    });
    if (!defaultIncomeAccount) {
      defaultIncomeAccount = await prisma.analyticAccount.create({
        data: { name: "General Sales Income", type: "INCOME" },
      });
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    let invoiceTotal = new Decimal(0);
    const linesData = input.lines.map((line) => {
      const qty = new Decimal(line.quantity);
      const price = new Decimal(line.unitPrice);
      const lineTotal = qty.mul(price);
      invoiceTotal = invoiceTotal.add(lineTotal);

      return {
        productId: line.productId,
        analyticAccountId: line.analyticAccountId || defaultIncomeAccount!.id,
        taxRateId: line.taxRateId || null,
        quantity: qty,
        unitPrice: price,
        lineTotal,
        taxAmount: new Decimal(0),
      };
    });

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        salesOrderId: input.salesOrderId || null,
        invoiceReference: input.invoiceReference || null,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: new Date(input.dueDate),
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        total: invoiceTotal,
        amountPaid: new Decimal(0),
        amountDue: invoiceTotal,
        createdById: userId,
        lines: {
          create: linesData,
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
      },
    });

    return invoice;
  }

  async confirm(id: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: { lines: true, customer: true },
    });
    if (!invoice) throw new NotFoundError("Customer invoice not found");
    if (invoice.status !== DocumentStatus.DRAFT) {
      throw new ValidationError("Only draft invoices can be confirmed");
    }

    return prisma.customerInvoice.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
    });
  }

  async recordPayment(input: RecordInvoicePaymentInput) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: input.invoiceId },
    });
    if (!invoice) throw new NotFoundError("Customer invoice not found");
    if (invoice.status !== DocumentStatus.CONFIRMED) {
      throw new ValidationError("Payments can only be recorded on confirmed invoices");
    }

    const payAmount = new Decimal(input.amount);
    if (payAmount.lte(0)) {
      throw new ValidationError("Payment amount must be greater than zero");
    }
    if (payAmount.gt(invoice.amountDue)) {
      throw new ValidationError(
        `Payment amount (${payAmount.toString()}) cannot exceed amount due (${invoice.amountDue.toString()})`
      );
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.invoicePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: payAmount,
          paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
          paymentMethod: input.paymentMethod,
          note: input.note,
        },
      });

      const newAmountPaid = invoice.amountPaid.add(payAmount);
      const newAmountDue = invoice.total.sub(newAmountPaid);
      const newPaymentStatus = newAmountDue.isZero()
        ? PaymentStatus.PAID
        : PaymentStatus.PARTIAL;

      await tx.customerInvoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus,
        },
      });

      return payment;
    });
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await prisma.customerInvoice.count();
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.invoiceNumberPrefix || "INV";
    return `${prefix}-${String(count + 1).padStart(5, "0")}`;
  }
}

export const customerInvoiceService = new CustomerInvoiceService();
