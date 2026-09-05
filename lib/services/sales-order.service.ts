/**
 * Sales Order Service
 * Handles creation, updating, confirmation, cancellation, and querying of sales orders
 */

import { PrismaClient, DocumentStatus, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface SalesOrderLineInput {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string;
  analyticAccountId?: string;
}

export interface CreateSalesOrderInput {
  customerId: string;
  orderDate: Date;
  deliveryDate?: Date;
  lines: SalesOrderLineInput[];
  notes?: string;
  userId?: string;
  createdById?: string;
}

export interface UpdateSalesOrderInput {
  id: string;
  customerId?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  lines?: SalesOrderLineInput[];
  notes?: string;
}

export interface ConfirmSalesOrderInput {
  id: string;
}

export interface ListSalesOrdersParams {
  customerId?: string;
  status?: DocumentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class SalesOrderService {
  /**
   * Create a new sales order in DRAFT status
   */
  async create(input: CreateSalesOrderInput) {
    // Validate required fields
    if (!input.customerId) {
      throw new ValidationError("Customer is required");
    }
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    // Verify customer exists and is a CUSTOMER or BOTH
    const customer = await prisma.contact.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.type !== "CUSTOMER" && customer.type !== "BOTH") {
      throw new ValidationError("Selected contact is not a customer");
    }

    // Verify all products exist
    const productIds = input.lines.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ValidationError("One or more products not found");
    }

    // Find a default creator user if not supplied
    let createdById = input.createdById || input.userId;
    if (!createdById) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        throw new ValidationError("No user found in the system to assign as creator");
      }
      createdById = defaultUser.id;
    }

    // Find default analytic account for lines if not provided
    const defaultAnalyticAccount = await prisma.analyticAccount.findFirst({
      where: { type: "INCOME" },
    }) || await prisma.analyticAccount.findFirst();

    // Calculate line totals and grand total
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
          throw new ValidationError("Analytic account is required for sales order lines");
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

    // Generate SO number
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.soNumberPrefix || "SO";
    const count = await prisma.salesOrder.count();
    const soNumber = `${prefix}${String(count + 1).padStart(5, "0")}`;

    // Create sales order
    const salesOrder = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: input.customerId,
        orderDate: input.orderDate,
        total,
        status: "DRAFT",
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

    return salesOrder;
  }

  /**
   * Update an existing draft sales order
   */
  async update(input: UpdateSalesOrderInput) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: input.id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status !== "DRAFT") {
      throw new ConflictError("Only draft sales orders can be updated");
    }

    if (input.customerId) {
      const customer = await prisma.contact.findUnique({
        where: { id: input.customerId },
      });
      if (!customer) {
        throw new NotFoundError("Customer not found");
      }
      if (customer.type !== "CUSTOMER" && customer.type !== "BOTH") {
        throw new ValidationError("Selected contact is not a customer");
      }
    }

    // If updating lines, recalculate totals
    if (input.lines) {
      if (input.lines.length === 0) {
        throw new ValidationError("At least one line item is required");
      }

      const productIds = input.lines.map((l) => l.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        throw new ValidationError("One or more products not found");
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
            throw new ValidationError("Analytic account is required for sales order lines");
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
        await tx.salesOrderLine.deleteMany({
          where: { salesOrderId: input.id },
        });

        return tx.salesOrder.update({
          where: { id: input.id },
          data: {
            customerId: input.customerId,
            orderDate: input.orderDate,
            total,
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

    // Simple update (no line changes)
    const updated = await prisma.salesOrder.update({
      where: { id: input.id },
      data: {
        customerId: input.customerId,
        orderDate: input.orderDate,
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
   * Confirm a draft sales order
   */
  async confirm(input: ConfirmSalesOrderInput) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: input.id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status !== "DRAFT") {
      throw new ConflictError("Only draft sales orders can be confirmed");
    }

    return prisma.salesOrder.update({
      where: { id: input.id },
      data: { status: "CONFIRMED" },
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
   * Cancel a sales order
   */
  async cancel(id: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status === "CANCELLED") {
      throw new ConflictError("Sales order is already cancelled");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
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
   * Find sales order by ID
   */
  async findById(id: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
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

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    return salesOrder;
  }

  /**
   * List sales orders with filtering and pagination
   */
  async list(params: ListSalesOrdersParams) {
    const { customerId, status, startDate, endDate, page = 1, limit = 20 } = params;

    const where: Prisma.SalesOrderWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(startDate && { orderDate: { gte: startDate } }),
      ...(endDate && { orderDate: { lte: endDate } }),
    };

    const [salesOrders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
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
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return {
      data: salesOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const salesOrderService = new SalesOrderService();
