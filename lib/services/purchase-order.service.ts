/**
 * Purchase Order Service
 * Handles purchase order lifecycle: Draft -> Confirmed -> Cancelled
 */

import { PrismaClient, DocumentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface PurchaseOrderLineInput {
  productId: string;
  analyticAccountId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  orderDate: Date | string;
  expectedDate?: Date | string;
  notes?: string;
  lines: PurchaseOrderLineInput[];
  userId?: string;
}

export interface ListPurchaseOrdersParams {
  status?: DocumentStatus;
  vendorId?: string;
  page?: number;
  limit?: number;
}

export class PurchaseOrderService {
  async list(params: ListPurchaseOrdersParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.vendorId) where.vendorId = params.vendorId;

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: { select: { id: true, name: true, email: true } },
          lines: {
            include: {
              product: { select: { id: true, name: true } },
              analyticAccount: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
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
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        vendorBills: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    return order;
  }

  async create(input: CreatePurchaseOrderInput) {
    if (!input.vendorId) {
      throw new ValidationError("Vendor is required");
    }
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    // Resolve or find a default user if none provided
    let userId = input.userId;
    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) throw new ValidationError("No registered user found");
      userId = user.id;
    }

    // Resolve default analytic account for expenses if missing
    let defaultExpenseAccount = await prisma.analyticAccount.findFirst({
      where: { type: "EXPENSES" },
    });
    if (!defaultExpenseAccount) {
      defaultExpenseAccount = await prisma.analyticAccount.create({
        data: { name: "General Operations", type: "EXPENSES" },
      });
    }

    const orderNumber = await this.generatePoNumber();

    let orderTotal = new Decimal(0);
    const linesData = input.lines.map((line) => {
      const qty = new Decimal(line.quantity);
      const price = new Decimal(line.unitPrice);
      const lineTotal = qty.mul(price);
      orderTotal = orderTotal.add(lineTotal);

      return {
        productId: line.productId,
        analyticAccountId: line.analyticAccountId || defaultExpenseAccount!.id,
        quantity: qty,
        unitPrice: price,
        lineTotal,
      };
    });

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber: orderNumber,
        vendorId: input.vendorId,
        orderDate: new Date(input.orderDate),
        status: DocumentStatus.DRAFT,
        total: orderTotal,
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

    return order;
  }

  async confirm(id: string) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
    });
    if (!order) throw new NotFoundError("Purchase order not found");
    if (order.status !== DocumentStatus.DRAFT) {
      throw new ValidationError("Only draft orders can be confirmed");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
    });
  }

  private async generatePoNumber(): Promise<string> {
    const count = await prisma.purchaseOrder.count();
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.poNumberPrefix || "PO";
    return `${prefix}-${String(count + 1).padStart(5, "0")}`;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
