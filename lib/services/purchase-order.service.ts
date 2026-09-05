import { prisma } from "@/lib/prisma";
import { DocumentStatus, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";



export interface CreatePurchaseOrderLineInput {
  productId: string;
  analyticAccountId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  orderDate: Date;
  lines: CreatePurchaseOrderLineInput[];
  createdById: string;
}

export interface UpdatePurchaseOrderInput {
  id: string;
  vendorId?: string;
  orderDate?: Date;
  lines?: CreatePurchaseOrderLineInput[];
}

export interface ListPurchaseOrdersParams {
  vendorId?: string;
  status?: DocumentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class PurchaseOrderService {
  private async generatePoNumber(): Promise<string> {
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.poNumberPrefix || "PO";

    const lastPo = await prisma.purchaseOrder.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastPo) {
      const match = lastPo.poNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(5, "0")}`;
  }

  private calculateLineTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  private calculateTotal(lines: CreatePurchaseOrderLineInput[]): number {
    return lines.reduce((sum, line) => {
      return sum + this.calculateLineTotal(line.quantity, line.unitPrice);
    }, 0);
  }

  async create(input: CreatePurchaseOrderInput) {
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("Purchase order must have at least one line");
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

    const poNumber = await this.generatePoNumber();
    const total = this.calculateTotal(input.lines);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: input.vendorId,
        orderDate: input.orderDate,
        status: DocumentStatus.DRAFT,
        total: new Prisma.Decimal(total),
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
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    return po;
  }

  async update(input: UpdatePurchaseOrderInput) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: input.id },
      include: { lines: true },
    });

    if (!po) {
      throw new NotFoundError("Purchase order not found");
    }

    if (po.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only DRAFT purchase orders can be updated");
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

    const updateData: Prisma.PurchaseOrderUncheckedUpdateInput = {
      vendorId: input.vendorId,
      orderDate: input.orderDate,
    };

    if (input.lines) {
      if (input.lines.length === 0) {
        throw new ValidationError("Purchase order must have at least one line");
      }

      const total = this.calculateTotal(input.lines);
      updateData.total = new Prisma.Decimal(total);
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

    const updated = await prisma.purchaseOrder.update({
      where: { id: input.id },
      data: updateData,
      include: {
        vendor: true,
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
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError("Purchase order not found");
    }

    if (po.status !== DocumentStatus.DRAFT) {
      throw new ConflictError("Only DRAFT purchase orders can be confirmed");
    }

    const confirmed = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    return confirmed;
  }

  async cancel(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError("Purchase order not found");
    }

    if (po.status === DocumentStatus.CANCELLED) {
      throw new ConflictError("Purchase order is already cancelled");
    }

    const cancelled = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: DocumentStatus.CANCELLED },
      include: {
        vendor: true,
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
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        createdBy: true,
      },
    });

    if (!po) {
      throw new NotFoundError("Purchase order not found");
    }

    return po;
  }

  async list(params: ListPurchaseOrdersParams) {
    const { vendorId, status, startDate, endDate, page = 1, limit = 20 } = params;

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(vendorId && { vendorId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: true,
          createdBy: true,
          _count: {
            select: { lines: true },
          },
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: purchaseOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const purchaseOrderService = new PurchaseOrderService();
