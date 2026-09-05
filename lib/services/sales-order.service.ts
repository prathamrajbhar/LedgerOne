/**
 * Sales Order Service
 * Manages customer sales orders lifecycle
 */

import { PrismaClient, DocumentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface SalesOrderLineInput {
  productId: string;
  analyticAccountId?: string;
  taxRateId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderInput {
  customerId: string;
  orderDate: Date | string;
  notes?: string;
  lines: SalesOrderLineInput[];
  userId?: string;
}

export interface ListSalesOrdersParams {
  status?: DocumentStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class SalesOrderService {
  async list(params: ListSalesOrdersParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.customerId) where.customerId = params.customerId;

    const [data, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
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
      prisma.salesOrder.count({ where }),
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
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: true,
            analyticAccount: true,
            taxRate: true,
          },
        },
        invoices: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Sales order not found");
    }

    return order;
  }

  async create(input: CreateSalesOrderInput) {
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
        data: { name: "Product Sales Income", type: "INCOME" },
      });
    }

    const orderNumber = await this.generateSoNumber();

    let orderTotal = new Decimal(0);
    const linesData = input.lines.map((line) => {
      const qty = new Decimal(line.quantity);
      const price = new Decimal(line.unitPrice);
      const lineTotal = qty.mul(price);
      orderTotal = orderTotal.add(lineTotal);

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

    const order = await prisma.salesOrder.create({
      data: {
        soNumber: orderNumber,
        customerId: input.customerId,
        orderDate: new Date(input.orderDate),
        status: DocumentStatus.DRAFT,
        total: orderTotal,
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
          },
        },
      },
    });

    return order;
  }

  async confirm(id: string) {
    const order = await prisma.salesOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundError("Sales order not found");
    if (order.status !== DocumentStatus.DRAFT) {
      throw new ValidationError("Only draft sales orders can be confirmed");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
    });
  }

  private async generateSoNumber(): Promise<string> {
    const count = await prisma.salesOrder.count();
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.soNumberPrefix || "SO";
    return `${prefix}-${String(count + 1).padStart(5, "0")}`;
  }
}

export const salesOrderService = new SalesOrderService();
