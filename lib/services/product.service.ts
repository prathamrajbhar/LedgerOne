import { PrismaClient, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateProductInput {
  name: string;
  type: "GOODS" | "SERVICE" | "COMBO";
  categoryId: string;
  salesPrice: number;
  cost: number;
  image?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  type?: "GOODS" | "SERVICE" | "COMBO";
  categoryId?: string;
  salesPrice?: number;
  cost?: number;
  image?: string;
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

    const category = await prisma.productCategory.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new ValidationError("Product category not found");
    }

    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        type: input.type,
        categoryId: input.categoryId,
        salesPrice: new Prisma.Decimal(input.salesPrice),
        cost: new Prisma.Decimal(input.cost),
        image: input.image,
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  async update(input: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (input.salesPrice !== undefined && input.salesPrice < 0) {
      throw new ValidationError("Sales price cannot be negative");
    }
    if (input.cost !== undefined && input.cost < 0) {
      throw new ValidationError("Cost cannot be negative");
    }

    if (input.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new ValidationError("Product category not found");
      }
    }

    const updated = await prisma.product.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        type: input.type,
        categoryId: input.categoryId,
        salesPrice: input.salesPrice ? new Prisma.Decimal(input.salesPrice) : undefined,
        cost: input.cost ? new Prisma.Decimal(input.cost) : undefined,
        image: input.image,
      },
      include: {
        category: true,
      },
    });

    return updated;
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
      ...(!includeArchived && { isArchived: false }),
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
}

export const productService = new ProductService();
