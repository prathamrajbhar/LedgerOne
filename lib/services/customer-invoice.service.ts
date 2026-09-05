import { prisma } from "@/lib/prisma";
/**
 * Customer Invoice Service
 * Handles customer invoice creation (from SO or standalone), confirmation (Journal Entry #1),
 * cancellation, payment status tracking, and querying.
 */

import { DocumentStatus, PaymentStatus, Prisma, JournalEntrySource, JournalType, AccountType } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";
import { journalEntryService } from "./journal-entry.service";



export interface CustomerInvoiceLineInput {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string;
  analyticAccountId?: string;
}

export interface CreateStandaloneInvoiceInput {
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  invoiceReference?: string;
  lines: CustomerInvoiceLineInput[];
  notes?: string;
  userId?: string;
  createdById?: string;
}

export interface UpdateCustomerInvoiceInput {
  id: string;
  customerId?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  invoiceReference?: string;
  lines?: CustomerInvoiceLineInput[];
  notes?: string;
}

export interface ListCustomerInvoicesParams {
  customerId?: string;
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  salesOrderId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class CustomerInvoiceService {
  /**
   * Create invoice from a confirmed Sales Order
   */
  async createFromSalesOrder(salesOrderId: string, invoiceDate?: Date, dueDate?: Date, userId?: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status !== "CONFIRMED") {
      throw new ConflictError("Can only create invoice from confirmed sales orders");
    }

    // Determine user
    let createdById = userId || salesOrder.createdById;
    if (!createdById) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        throw new ValidationError("No user found to set as creator");
      }
      createdById = defaultUser.id;
    }

    const invDate = invoiceDate || new Date();
    const invDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    // Calculate totals from SO lines
    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const invoiceLines = salesOrder.lines.map((line) => {
      const lineSubtotal = line.quantity.mul(line.unitPrice);
      const taxAmt = line.taxAmount || new Prisma.Decimal(0);

      subtotal = subtotal.add(lineSubtotal);
      totalTax = totalTax.add(taxAmt);

      return {
        productId: line.productId,
        analyticAccountId: line.analyticAccountId,
        taxRateId: line.taxRateId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        taxAmount: taxAmt,
      };
    });

    const total = subtotal.add(totalTax);

    // Generate invoice number
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.invoiceNumberPrefix || "INV";
    const count = await prisma.customerInvoice.count();
    const invoiceNumber = `${prefix}${String(count + 1).padStart(5, "0")}`;

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId: salesOrder.customerId,
        salesOrderId: salesOrder.id,
        invoiceDate: invDate,
        dueDate: invDueDate,
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        total,
        amountPaid: new Prisma.Decimal(0),
        amountDue: total,
        createdById,
        lines: {
          create: invoiceLines,
        },
      },
      include: {
        customer: true,
        createdBy: true,
        salesOrder: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Create standalone customer invoice
   */
  async createStandalone(input: CreateStandaloneInvoiceInput) {
    if (!input.customerId) {
      throw new ValidationError("Customer is required");
    }
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    const customer = await prisma.contact.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.type !== "CUSTOMER" && customer.type !== "BOTH") {
      throw new ValidationError("Selected contact is not a customer");
    }

    const productIds = input.lines.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ValidationError("One or more products not found");
    }

    let createdById = input.createdById || input.userId;
    if (!createdById) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        throw new ValidationError("No user found to set as creator");
      }
      createdById = defaultUser.id;
    }

    const defaultAnalyticAccount = await prisma.analyticAccount.findFirst({
      where: { type: "INCOME" },
    }) || await prisma.analyticAccount.findFirst();

    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const linesWithTotals = await Promise.all(
      input.lines.map(async (line) => {
        if (line.quantity <= 0) {
          throw new ValidationError("Line quantity must be greater than zero");
        }
        if (line.unitPrice < 0) {
          throw new ValidationError("Line unit price cannot be negative");
        }

        const lineSubtotal = new Prisma.Decimal(line.quantity).mul(new Prisma.Decimal(line.unitPrice));
        let lineTax = new Prisma.Decimal(0);

        if (line.taxRateId) {
          const taxRate = await prisma.taxRate.findUnique({
            where: { id: line.taxRateId },
          });
          if (taxRate) {
            lineTax = lineSubtotal.mul(taxRate.percentage).div(100);
          }
        }

        const lineTotal = lineSubtotal.add(lineTax);
        subtotal = subtotal.add(lineSubtotal);
        totalTax = totalTax.add(lineTax);

        const analyticAccountId = line.analyticAccountId || defaultAnalyticAccount?.id;
        if (!analyticAccountId) {
          throw new ValidationError("Analytic account is required for invoice lines");
        }

        return {
          productId: line.productId,
          analyticAccountId,
          quantity: new Prisma.Decimal(line.quantity),
          unitPrice: new Prisma.Decimal(line.unitPrice),
          taxRateId: line.taxRateId || null,
          lineTotal,
          taxAmount: lineTax,
        };
      })
    );

    const total = subtotal.add(totalTax);

    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.invoiceNumberPrefix || "INV";
    const count = await prisma.customerInvoice.count();
    const invoiceNumber = `${prefix}${String(count + 1).padStart(5, "0")}`;

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        invoiceReference: input.invoiceReference,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        total,
        amountPaid: new Prisma.Decimal(0),
        amountDue: total,
        createdById,
        lines: {
          create: linesWithTotals,
        },
      },
      include: {
        customer: true,
        createdBy: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Update draft invoice
   */
  async update(input: UpdateCustomerInvoiceInput) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: input.id },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    if (invoice.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only draft invoices can be updated");
    }

    if (input.lines) {
      if (input.lines.length === 0) {
        throw new ValidationError("At least one line item is required");
      }

      const defaultAnalyticAccount = await prisma.analyticAccount.findFirst({
        where: { type: "INCOME" },
      }) || await prisma.analyticAccount.findFirst();

      let subtotal = new Prisma.Decimal(0);
      let totalTax = new Prisma.Decimal(0);

      const linesWithTotals = await Promise.all(
        input.lines.map(async (line) => {
          if (line.quantity <= 0) {
            throw new ValidationError("Line quantity must be greater than zero");
          }
          if (line.unitPrice < 0) {
            throw new ValidationError("Line unit price cannot be negative");
          }

          const lineSubtotal = new Prisma.Decimal(line.quantity).mul(new Prisma.Decimal(line.unitPrice));
          let lineTax = new Prisma.Decimal(0);

          if (line.taxRateId) {
            const taxRate = await prisma.taxRate.findUnique({
              where: { id: line.taxRateId },
            });
            if (taxRate) {
              lineTax = lineSubtotal.mul(taxRate.percentage).div(100);
            }
          }

          const lineTotal = lineSubtotal.add(lineTax);
          subtotal = subtotal.add(lineSubtotal);
          totalTax = totalTax.add(lineTax);

          const analyticAccountId = line.analyticAccountId || defaultAnalyticAccount?.id;
          if (!analyticAccountId) {
            throw new ValidationError("Analytic account is required for invoice lines");
          }

          return {
            productId: line.productId,
            analyticAccountId,
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            taxRateId: line.taxRateId || null,
            lineTotal,
            taxAmount: lineTax,
          };
        })
      );

      const total = subtotal.add(totalTax);

      const updated = await prisma.$transaction(async (tx) => {
        await tx.customerInvoiceLine.deleteMany({
          where: { invoiceId: input.id },
        });

        return tx.customerInvoice.update({
          where: { id: input.id },
          data: {
            customerId: input.customerId,
            invoiceReference: input.invoiceReference,
            invoiceDate: input.invoiceDate,
            dueDate: input.dueDate,
            total,
            amountDue: total.sub(invoice.amountPaid),
            lines: {
              create: linesWithTotals,
            },
          },
          include: {
            customer: true,
            createdBy: true,
            lines: {
              include: {
                product: true,
                taxRate: true,
                analyticAccount: true,
              },
            },
          },
        });
      });

      return updated;
    }

    const updated = await prisma.customerInvoice.update({
      where: { id: input.id },
      data: {
        customerId: input.customerId,
        invoiceReference: input.invoiceReference,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
      },
      include: {
        customer: true,
        createdBy: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Confirm customer invoice → generates Journal Entry #1
   * (Debit: Accounts Receivable, Credit: Income Account)
   */
  async confirm(id: string, userId?: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    if (invoice.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only draft invoices can be confirmed");
    }

    // Determine creator / actor
    let actionUserId = userId || invoice.createdById;
    if (!actionUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        throw new ValidationError("No user found to attribute journal entry");
      }
      actionUserId = defaultUser.id;
    }

    // Find Sales Journal
    const journal = await prisma.journal.findFirst({
      where: { type: JournalType.SALES },
    }) || await prisma.journal.findFirst();

    if (!journal) {
      throw new ValidationError("No Sales Journal configured in Chart of Accounts");
    }

    // Fetch company settings for debtors account configuration
    const settings = await prisma.companySettings.findFirst();
    if (!settings?.debtorsAccountId) {
      throw new ValidationError("Debtors account not configured in company settings");
    }

    // Find Accounts Receivable using configured debtorsAccountId
    const arAccount = await prisma.chartOfAccount.findUnique({
      where: { id: settings.debtorsAccountId }
    });

    if (!arAccount) {
      throw new ValidationError("Configured debtors account not found");
    }

    // Find Income Account
    const incomeAccount = await prisma.chartOfAccount.findFirst({
      where: { type: AccountType.INCOME },
    });

    if (!incomeAccount) {
      throw new ValidationError("Income account missing in Chart of Accounts");
    }

    // Confirm invoice and generate Journal Entry #1
    const confirmedInvoice = await prisma.customerInvoice.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
      include: {
        customer: true,
        createdBy: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });

    // Generate Journal Entry #1:
    // Line 1: Debit Accounts Receivable (total) with partnerId = customerId
    // Line 2: Credit Income Account (total)
    await journalEntryService.autoGenerate({
      source: JournalEntrySource.CUSTOMER_INVOICE,
      journalId: journal.id,
      accountingDate: invoice.invoiceDate,
      sourceDocumentId: invoice.id,
      userId: actionUserId,
      lines: [
        {
          accountId: arAccount.id,
          partnerId: invoice.customerId,
          debit: invoice.total,
          credit: new Prisma.Decimal(0),
        },
        {
          accountId: incomeAccount.id,
          partnerId: invoice.customerId,
          debit: new Prisma.Decimal(0),
          credit: invoice.total,
        },
      ],
    });

    return confirmedInvoice;
  }

  /**
   * Cancel customer invoice
   */
  async cancel(id: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    if (invoice.status === DocumentStatus.CANCELLED) {
      throw new ConflictError("Invoice is already cancelled");
    }

    return prisma.customerInvoice.update({
      where: { id },
      data: { status: DocumentStatus.CANCELLED },
      include: {
        customer: true,
        createdBy: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
      },
    });
  }

  /**
   * Recalculate invoice payment status and amounts based on linked InvoicePayment records
   */
  async updatePaymentStatus(id: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    let totalPaid = new Prisma.Decimal(0);
    for (const payment of invoice.payments) {
      totalPaid = totalPaid.add(payment.amount);
    }

    const amountDue = invoice.total.sub(totalPaid);
    let paymentStatus: PaymentStatus = PaymentStatus.NOT_PAID;

    if (amountDue.lte(0)) {
      paymentStatus = PaymentStatus.PAID;
    } else if (totalPaid.gt(0)) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    return prisma.customerInvoice.update({
      where: { id },
      data: {
        amountPaid: totalPaid,
        amountDue: amountDue.lt(0) ? new Prisma.Decimal(0) : amountDue,
        paymentStatus,
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  /**
   * Find invoice by ID
   */
  async findById(id: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
        salesOrder: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
        payments: true,
        journalEntries: {
          include: {
            lines: {
              include: {
                account: true,
              },
            },
          },
        },
        gatewayTransactions: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError("Customer invoice not found");
    }

    return invoice;
  }

  /**
   * List customer invoices with filtering and pagination
   */
  async list(params: ListCustomerInvoicesParams) {
    const { customerId, status, paymentStatus, salesOrderId, startDate, endDate, page = 1, limit = 20 } = params;

    const where: Prisma.CustomerInvoiceWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(salesOrderId && { salesOrderId }),
      ...(startDate && { invoiceDate: { gte: startDate } }),
      ...(endDate && { invoiceDate: { lte: endDate } }),
    };

    const [invoices, total] = await Promise.all([
      prisma.customerInvoice.findMany({
        where,
        include: {
          customer: true,
          createdBy: true,
          salesOrder: true,
          lines: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
        orderBy: { invoiceDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customerInvoice.count({ where }),
    ]);

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const customerInvoiceService = new CustomerInvoiceService();
