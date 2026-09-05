import { PrismaClient, DocumentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateVendorBillLineInput {
  productId: string;
  analyticAccountId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateVendorBillInput {
  vendorId: string;
  purchaseOrderId?: string;
  billDate: Date;
  dueDate: Date;
  lines: CreateVendorBillLineInput[];
  createdById: string;
}

export interface UpdateVendorBillInput {
  id: string;
  vendorId?: string;
  billDate?: Date;
  dueDate?: Date;
  lines?: CreateVendorBillLineInput[];
}

export interface ListVendorBillsParams {
  vendorId?: string;
  purchaseOrderId?: string;
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class VendorBillService {
  private async generateBillNumber(): Promise<string> {
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.billNumberPrefix || "BILL";

    const lastBill = await prisma.vendorBill.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastBill) {
      const match = lastBill.billNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(5, "0")}`;
  }

  private calculateLineTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  private calculateTotal(lines: CreateVendorBillLineInput[]): number {
    return lines.reduce((sum, line) => {
      return sum + this.calculateLineTotal(line.quantity, line.unitPrice);
    }, 0);
  }

  async create(input: CreateVendorBillInput) {
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("Vendor bill must have at least one line");
    }

    if (input.dueDate < input.billDate) {
      throw new ValidationError("Due date cannot be before bill date");
    }

    const vendor = await prisma.contact.findUnique({
      where: { id: input.vendorId },
    });

    if (!vendor) {
      throw new ValidationError("Vendor not found");
    }

    if (vendor.type !== "VENDOR" && vendor.type !== "BOTH") {
      throw new ValidationError("Contact must be a vendor");
    }

    if (input.purchaseOrderId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
      });

      if (!po) {
        throw new ValidationError("Purchase order not found");
      }

      if (po.status !== DocumentStatus.CONFIRMED) {
        throw new ValidationError("Can only create bill from confirmed purchase order");
      }
    }

    for (const line of input.lines) {
      if (line.quantity <= 0) {
        throw new ValidationError("Quantity must be greater than 0");
      }
      if (line.unitPrice < 0) {
        throw new ValidationError("Unit price cannot be negative");
      }

      const product = await prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product) {
        throw new ValidationError(`Product ${line.productId} not found`);
      }

      const analyticAccount = await prisma.analyticAccount.findUnique({
        where: { id: line.analyticAccountId },
      });
      if (!analyticAccount) {
        throw new ValidationError(`Analytic account ${line.analyticAccountId} not found`);
      }
    }

    const billNumber = await this.generateBillNumber();
    const total = this.calculateTotal(input.lines);

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorId: input.vendorId,
        purchaseOrderId: input.purchaseOrderId,
        billDate: input.billDate,
        dueDate: input.dueDate,
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        total: new Prisma.Decimal(total),
        amountPaid: new Prisma.Decimal(0),
        amountDue: new Prisma.Decimal(total),
        createdById: input.createdById,
        lines: {
          create: input.lines.map((line) => ({
            productId: line.productId,
            analyticAccountId: line.analyticAccountId,
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            lineTotal: new Prisma.Decimal(this.calculateLineTotal(line.quantity, line.unitPrice)),
          })),
        },
      },
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    return bill;
  }

  async update(input: UpdateVendorBillInput) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: input.id },
      include: { lines: true },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    if (bill.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only DRAFT vendor bills can be updated");
    }

    if (input.dueDate && input.billDate && input.dueDate < input.billDate) {
      throw new ValidationError("Due date cannot be before bill date");
    }

    if (input.vendorId) {
      const vendor = await prisma.contact.findUnique({
        where: { id: input.vendorId },
      });

      if (!vendor) {
        throw new ValidationError("Vendor not found");
      }

      if (vendor.type !== "VENDOR" && vendor.type !== "BOTH") {
        throw new ValidationError("Contact must be a vendor");
      }
    }

    const updateData: Prisma.VendorBillUncheckedUpdateInput = {
      vendorId: input.vendorId,
      billDate: input.billDate,
      dueDate: input.dueDate,
    };

    if (input.lines) {
      if (input.lines.length === 0) {
        throw new ValidationError("Vendor bill must have at least one line");
      }

      const total = this.calculateTotal(input.lines);
      updateData.total = new Prisma.Decimal(total);
      updateData.amountDue = new Prisma.Decimal(total);
      updateData.lines = {
        deleteMany: {},
        create: input.lines.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.analyticAccountId,
          quantity: new Prisma.Decimal(line.quantity),
          unitPrice: new Prisma.Decimal(line.unitPrice),
          lineTotal: new Prisma.Decimal(this.calculateLineTotal(line.quantity, line.unitPrice)),
        })),
      };
    }

    const updated = await prisma.vendorBill.update({
      where: { id: input.id },
      data: updateData,
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    return updated;
  }

  async confirm(id: string) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines: {
          include: {
            analyticAccount: true,
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    if (bill.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only DRAFT vendor bills can be confirmed");
    }

    const purchaseJournal = await prisma.journal.findFirst({
      where: { type: "PURCHASE" },
    });

    if (!purchaseJournal) {
      throw new ValidationError("Purchase journal not found. Please configure journals first.");
    }

    // Fetch company settings for Accounts Payable (Creditors) account
    const companySettings = await prisma.companySettings.findFirst();

    if (!companySettings?.creditorsAccountId) {
      throw new ValidationError(
        "Accounts Payable (Creditors) account not configured in Company Settings. Please configure it before confirming vendor bills."
      );
    }

    // Fetch the creditors account (Accounts Payable - credit side)
    const creditorsAccount = await prisma.chartOfAccount.findUnique({
      where: { id: companySettings.creditorsAccountId },
    });

    if (!creditorsAccount) {
      throw new ValidationError("Configured Accounts Payable account not found in Chart of Accounts");
    }

    // Fetch expense account (debit side)
    const expenseAccount = await prisma.chartOfAccount.findFirst({
      where: { type: "EXPENSES" },
    });

    if (!expenseAccount) {
      throw new ValidationError("No expense account found in Chart of Accounts. Please add at least one EXPENSES type account.");
    }

    const jeNumber = await this.generateJournalEntryNumber();

    await prisma.$transaction(async (tx) => {
      await tx.vendorBill.update({
        where: { id },
        data: { status: DocumentStatus.CONFIRMED },
      });

      // Generate Journal Entry #1:
      // Line 1: Debit Expense Account (total) with partnerId = vendorId
      // Line 2: Credit Accounts Payable/Creditors (total) with partnerId = vendorId
      await tx.journalEntry.create({
        data: {
          entryNumber: jeNumber,
          journalId: purchaseJournal.id,
          accountingDate: bill.billDate,
          status: "POSTED",
          source: "VENDOR_BILL",
          vendorBillId: bill.id,
          totalDebit: bill.total,
          totalCredit: bill.total,
          createdById: bill.createdById,
          lines: {
            create: [
              {
                accountId: expenseAccount.id,
                partnerId: bill.vendorId,
                debit: bill.total,
                credit: new Prisma.Decimal(0),
              },
              {
                accountId: creditorsAccount.id,
                partnerId: bill.vendorId,
                debit: new Prisma.Decimal(0),
                credit: bill.total,
              },
            ],
          },
        },
      });
    });

    const confirmed = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
        journalEntries: {
          include: {
            lines: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    return confirmed;
  }

  private async generateJournalEntryNumber(): Promise<string> {
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.jeNumberPrefix || "JE";

    const lastJe = await prisma.journalEntry.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastJe) {
      const match = lastJe.entryNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(5, "0")}`;
  }

  async cancel(id: string) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    if (bill.status === DocumentStatus.CANCELLED) {
      throw new ConflictError("Vendor bill is already cancelled");
    }

    if (bill.payments.length > 0) {
      throw new ConflictError("Cannot cancel vendor bill with existing payments");
    }

    const cancelled = await prisma.vendorBill.update({
      where: { id },
      data: { status: DocumentStatus.CANCELLED },
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    return cancelled;
  }

  async findById(id: string) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: true,
        lines: {
          include: {
            product: true,
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
        createdBy: true,
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    return bill;
  }

  async list(params: ListVendorBillsParams) {
    const { vendorId, purchaseOrderId, status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = params;

    const where: Prisma.VendorBillWhereInput = {
      ...(vendorId && { vendorId }),
      ...(purchaseOrderId && { purchaseOrderId }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(startDate && endDate && {
        billDate: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [vendorBills, total] = await Promise.all([
      prisma.vendorBill.findMany({
        where,
        include: {
          vendor: true,
          purchaseOrder: true,
          createdBy: true,
          _count: {
            select: { lines: true, payments: true },
          },
        },
        orderBy: { billDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendorBill.count({ where }),
    ]);

    return {
      data: vendorBills,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async computePaymentStatus(billId: string): Promise<PaymentStatus> {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: {
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    const totalPaid = bill.payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    if (totalPaid === 0) {
      return PaymentStatus.NOT_PAID;
    } else if (totalPaid >= Number(bill.total)) {
      return PaymentStatus.PAID;
    } else {
      return PaymentStatus.PARTIAL;
    }
  }

  async updatePaymentStatus(billId: string) {
    const paymentStatus = await this.computePaymentStatus(billId);

    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: {
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    const totalPaid = bill.payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    const amountDue = Number(bill.total) - totalPaid;

    await prisma.vendorBill.update({
      where: { id: billId },
      data: {
        paymentStatus,
        amountPaid: new Prisma.Decimal(totalPaid),
        amountDue: new Prisma.Decimal(Math.max(0, amountDue)),
      },
    });
  }
}

export const vendorBillService = new VendorBillService();
