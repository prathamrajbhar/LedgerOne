/**
 * Vendor Bill Service
 * Manages vendor bills, approval workflows, and bill payments
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

export interface VendorBillLineInput {
  productId: string;
  analyticAccountId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateVendorBillInput {
  vendorId: string;
  billDate: Date | string;
  dueDate: Date | string;
  purchaseOrderId?: string;
  lines: VendorBillLineInput[];
  userId?: string;
}

export interface RecordBillPaymentInput {
  billId: string;
  amount: number | Decimal;
  paymentMethod: PaymentMethod;
  paymentDate?: Date | string;
  note?: string;
  userId?: string;
}

export interface ListVendorBillsParams {
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  vendorId?: string;
  page?: number;
  limit?: number;
}

export class VendorBillService {
  async list(params: ListVendorBillsParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
    if (params.vendorId) where.vendorId = params.vendorId;

    const [data, total] = await Promise.all([
      prisma.vendorBill.findMany({
        where,
        include: {
          vendor: { select: { id: true, name: true, email: true } },
          purchaseOrder: { select: { id: true, poNumber: true } },
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
      prisma.vendorBill.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: true,
        createdBy: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundError("Vendor bill not found");
    }

    return bill;
  }

  async create(input: CreateVendorBillInput) {
    if (!input.vendorId) throw new ValidationError("Vendor is required");
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    let userId = input.userId;
    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) throw new ValidationError("No registered user found");
      userId = user.id;
    }

    let defaultExpenseAccount = await prisma.analyticAccount.findFirst({
      where: { type: "EXPENSES" },
    });
    if (!defaultExpenseAccount) {
      defaultExpenseAccount = await prisma.analyticAccount.create({
        data: { name: "General Operating Expenses", type: "EXPENSES" },
      });
    }

    const billNumber = await this.generateBillNumber();

    let billTotal = new Decimal(0);
    const linesData = input.lines.map((line) => {
      const qty = new Decimal(line.quantity);
      const price = new Decimal(line.unitPrice);
      const lineTotal = qty.mul(price);
      billTotal = billTotal.add(lineTotal);

      return {
        productId: line.productId,
        analyticAccountId: line.analyticAccountId || defaultExpenseAccount!.id,
        quantity: qty,
        unitPrice: price,
        lineTotal,
      };
    });

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorId: input.vendorId,
        purchaseOrderId: input.purchaseOrderId || null,
        billDate: new Date(input.billDate),
        dueDate: new Date(input.dueDate),
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        total: billTotal,
        amountPaid: new Decimal(0),
        amountDue: billTotal,
        createdById: userId,
        lines: {
          create: linesData,
        },
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
      },
    });

    return bill;
  }

  async confirm(id: string) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: { lines: true, vendor: true },
    });
    if (!bill) throw new NotFoundError("Vendor bill not found");
    if (bill.status !== DocumentStatus.DRAFT) {
      throw new ValidationError("Only draft bills can be confirmed");
    }

    return prisma.vendorBill.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
    });
  }

  async recordPayment(input: RecordBillPaymentInput) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: input.billId },
    });
    if (!bill) throw new NotFoundError("Vendor bill not found");
    if (bill.status !== DocumentStatus.CONFIRMED) {
      throw new ValidationError("Payments can only be recorded on confirmed bills");
    }

    const payAmount = new Decimal(input.amount);
    if (payAmount.lte(0)) {
      throw new ValidationError("Payment amount must be greater than zero");
    }
    if (payAmount.gt(bill.amountDue)) {
      throw new ValidationError(
        `Payment amount (${payAmount.toString()}) cannot exceed amount due (${bill.amountDue.toString()})`
      );
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.billPayment.create({
        data: {
          vendorBillId: bill.id,
          amount: payAmount,
          paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
          paymentMethod: input.paymentMethod,
          note: input.note,
        },
      });

      const newAmountPaid = bill.amountPaid.add(payAmount);
      const newAmountDue = bill.total.sub(newAmountPaid);
      const newPaymentStatus = newAmountDue.isZero()
        ? PaymentStatus.PAID
        : PaymentStatus.PARTIAL;

      await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus,
        },
      });

      return payment;
    });
  }

  private async generateBillNumber(): Promise<string> {
    const count = await prisma.vendorBill.count();
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.billNumberPrefix || "BILL";
    return `${prefix}-${String(count + 1).padStart(5, "0")}`;
  }
}

export const vendorBillService = new VendorBillService();
