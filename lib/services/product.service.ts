import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";



export interface CreateProductInput {
  name: string;
  type: "GOODS" | "SERVICE" | "COMBO";
  categoryId: string;
  sku?: string | null;
  material?: string | null;
  dimensions?: string | null;
  salesPrice: number;
  cost: number;
  stock?: number;
  reorderPoint?: number;
  image?: string | null;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  type?: "GOODS" | "SERVICE" | "COMBO";
  categoryId?: string;
  sku?: string | null;
  material?: string | null;
  dimensions?: string | null;
  salesPrice?: number;
  cost?: number;
  stock?: number;
  reorderPoint?: number;
  image?: string | null;
}

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  type?: "GOODS" | "SERVICE" | "COMBO";
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  async create(input: CreateProductInput) {
    if (!input.name?.trim()) {
      throw new ValidationError("Product name is required");
    }
    if (input.salesPrice < 0) {
      throw new ValidationError("Sales price cannot be negative");
    }
    if (input.cost < 0) {
      throw new ValidationError("Cost cannot be negative");
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }
    if (input.reorderPoint !== undefined && input.reorderPoint < 0) {
      throw new ValidationError("Reorder point cannot be negative");
    }

    const category = await prisma.productCategory.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new ValidationError("Product category not found");
    }

    const formattedSku = input.sku?.trim() || null;

    // Check SKU uniqueness if provided
    if (formattedSku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: formattedSku },
      });
      if (existingSku) {
        throw new ConflictError("SKU already exists");
      }
    }

    try {
      const product = await prisma.product.create({
        data: {
          name: input.name.trim(),
          type: input.type,
          categoryId: input.categoryId,
          sku: formattedSku,
          material: input.material?.trim() || null,
          dimensions: input.dimensions?.trim() || null,
          salesPrice: new Prisma.Decimal(input.salesPrice),
          cost: new Prisma.Decimal(input.cost),
          stock: input.stock ?? 0,
          reorderPoint: input.reorderPoint ?? 10,
          image: input.image || null,
        },
        include: {
          category: true,
        },
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("SKU already exists");
      }
      throw error;
    }
  }

  async update(input: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new ValidationError("Product name cannot be empty");
    }
    if (input.salesPrice !== undefined && input.salesPrice < 0) {
      throw new ValidationError("Sales price cannot be negative");
    }
    if (input.cost !== undefined && input.cost < 0) {
      throw new ValidationError("Cost cannot be negative");
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }
    if (input.reorderPoint !== undefined && input.reorderPoint < 0) {
      throw new ValidationError("Reorder point cannot be negative");
    }

    if (input.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new ValidationError("Product category not found");
      }
    }

    const formattedSku = input.sku !== undefined ? (input.sku?.trim() || null) : undefined;

    // Check SKU uniqueness if being updated to a non-null SKU
    if (formattedSku !== undefined && formattedSku !== null && formattedSku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: formattedSku },
      });
      if (existingSku && existingSku.id !== input.id) {
        throw new ConflictError("SKU already exists");
      }
    }

    const formattedMaterial = input.material !== undefined ? (input.material?.trim() || null) : undefined;
    const formattedDimensions = input.dimensions !== undefined ? (input.dimensions?.trim() || null) : undefined;

    try {
      const updated = await prisma.product.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.type !== undefined && { type: input.type }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(formattedSku !== undefined && { sku: formattedSku }),
          ...(formattedMaterial !== undefined && { material: formattedMaterial }),
          ...(formattedDimensions !== undefined && { dimensions: formattedDimensions }),
          ...(input.salesPrice !== undefined && { salesPrice: new Prisma.Decimal(input.salesPrice) }),
          ...(input.cost !== undefined && { cost: new Prisma.Decimal(input.cost) }),
          ...(input.stock !== undefined && { stock: input.stock }),
          ...(input.reorderPoint !== undefined && { reorderPoint: input.reorderPoint }),
          ...(input.image !== undefined && { image: input.image }),
        },
        include: {
          category: true,
        },
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("SKU already exists");
      }
      throw error;
    }
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  async list(params: ListProductsParams) {
    const { search, categoryId, type, includeArchived = false, page = 1, limit = 20 } = params;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      isArchived: includeArchived,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async archive(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.isArchived) {
      throw new ConflictError("Product is already archived");
    }

    return prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async restore(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.isArchived) {
      throw new ConflictError("Product is not archived");
    }

    return prisma.product.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async canDelete(id: string): Promise<boolean> {
    const [poLines, soLines, billLines, invoiceLines] = await Promise.all([
      prisma.purchaseOrderLine.count({ where: { productId: id } }),
      prisma.salesOrderLine.count({ where: { productId: id } }),
      prisma.vendorBillLine.count({ where: { productId: id } }),
      prisma.customerInvoiceLine.count({ where: { productId: id } }),
    ]);

    return poLines === 0 && soLines === 0 && billLines === 0 && invoiceLines === 0;
  }

  async getUsageDetails(id: string) {
    const [poLines, soLines, billLines, invoiceLines] = await Promise.all([
      prisma.purchaseOrderLine.findMany({
        where: { productId: id },
        include: { purchaseOrder: true },
        take: 10,
      }),
      prisma.salesOrderLine.findMany({
        where: { productId: id },
        include: { salesOrder: true },
        take: 10,
      }),
      prisma.vendorBillLine.findMany({
        where: { productId: id },
        include: { vendorBill: true },
        take: 10,
      }),
      prisma.customerInvoiceLine.findMany({
        where: { productId: id },
        include: { invoice: true },
        take: 10,
      }),
    ]);

    const dependencies = [
      ...soLines.map((l) => ({
        id: l.salesOrderId,
        lineId: l.id,
        type: "SALES_ORDER" as const,
        typeName: "Sales Order",
        reference: l.salesOrder.soNumber,
        date: l.salesOrder.orderDate.toISOString(),
        status: l.salesOrder.status,
        amount: Number(l.lineTotal),
        viewUrl: "/sales",
        canDeleteDirectly: l.salesOrder.status !== "CONFIRMED",
      })),
      ...invoiceLines.map((l) => ({
        id: l.invoiceId,
        lineId: l.id,
        type: "CUSTOMER_INVOICE" as const,
        typeName: "Customer Invoice",
        reference: l.invoice.invoiceNumber,
        date: l.invoice.invoiceDate.toISOString(),
        status: l.invoice.status,
        amount: Number(l.lineTotal),
        viewUrl: "/invoices",
        canDeleteDirectly: l.invoice.status === "DRAFT" || l.invoice.status === "CANCELLED",
      })),
      ...billLines.map((l) => ({
        id: l.vendorBillId,
        lineId: l.id,
        type: "VENDOR_BILL" as const,
        typeName: "Vendor Bill",
        reference: l.vendorBill.billNumber,
        date: l.vendorBill.billDate.toISOString(),
        status: l.vendorBill.status,
        amount: Number(l.lineTotal),
        viewUrl: "/bills",
        canDeleteDirectly: l.vendorBill.status === "DRAFT" || l.vendorBill.status === "CANCELLED",
      })),
      ...poLines.map((l) => ({
        id: l.purchaseOrderId,
        lineId: l.id,
        type: "PURCHASE_ORDER" as const,
        typeName: "Purchase Order",
        reference: l.purchaseOrder.poNumber,
        date: l.purchaseOrder.orderDate.toISOString(),
        status: l.purchaseOrder.status,
        amount: Number(l.lineTotal),
        viewUrl: "/purchases",
        canDeleteDirectly: l.purchaseOrder.status !== "CONFIRMED",
      })),
    ];

    return {
      canDelete: dependencies.length === 0,
      totalReferences: dependencies.length,
      breakdown: {
        salesOrders: soLines.length,
        invoices: invoiceLines.length,
        vendorBills: billLines.length,
        purchaseOrders: poLines.length,
      },
      dependencies,
    };
  }

  async deleteDependency(type: string, id: string, lineId?: string) {
    if (type === "SALES_ORDER") {
      if (lineId) {
        await prisma.salesOrderLine.delete({ where: { id: lineId } });
      } else {
        await prisma.salesOrder.delete({ where: { id } });
      }
    } else if (type === "CUSTOMER_INVOICE") {
      if (lineId) {
        await prisma.customerInvoiceLine.delete({ where: { id: lineId } });
      } else {
        await prisma.customerInvoice.delete({ where: { id } });
      }
    } else if (type === "VENDOR_BILL") {
      if (lineId) {
        await prisma.vendorBillLine.delete({ where: { id: lineId } });
      } else {
        await prisma.vendorBill.delete({ where: { id } });
      }
    } else if (type === "PURCHASE_ORDER") {
      if (lineId) {
        await prisma.purchaseOrderLine.delete({ where: { id: lineId } });
      } else {
        await prisma.purchaseOrder.delete({ where: { id } });
      }
    }
  }
}

export const productService = new ProductService();
