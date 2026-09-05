import { PrismaClient, AnalyticAccountType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateAnalyticAccountInput {
  name: string;
  type: AnalyticAccountType;
}

export interface UpdateAnalyticAccountInput {
  id: string;
  name?: string;
}

export interface ListAnalyticAccountsParams {
  search?: string;
  type?: AnalyticAccountType;
}

export class AnalyticAccountService {
  async create(input: CreateAnalyticAccountInput) {
    if (!input.name?.trim()) {
      throw new ValidationError("Analytic account name is required");
    }

    const existing = await prisma.analyticAccount.findUnique({
      where: { name: input.name.trim() },
    });

    if (existing) {
      throw new ConflictError("Analytic account name already exists");
    }

    const account = await prisma.analyticAccount.create({
      data: {
        name: input.name.trim(),
        type: input.type,
      },
    });

    return account;
  }

  async update(input: UpdateAnalyticAccountInput) {
    const account = await prisma.analyticAccount.findUnique({
      where: { id: input.id },
    });

    if (!account) {
      throw new NotFoundError("Analytic account not found");
    }

    if (input.name) {
      const existing = await prisma.analyticAccount.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new ConflictError("Analytic account name already exists");
      }
    }

    const updated = await prisma.analyticAccount.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
      },
    });

    return updated;
  }

  async findById(id: string) {
    const account = await prisma.analyticAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Analytic account not found");
    }

    return account;
  }

  async list(params: ListAnalyticAccountsParams) {
    const { search, type } = params;

    const where: Prisma.AnalyticAccountWhereInput = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(type && { type }),
    };

    const accounts = await prisma.analyticAccount.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return accounts;
  }

  async canDelete(id: string): Promise<boolean> {
    const [poLines, soLines, billLines, invoiceLines, budgetLines] = await Promise.all([
      prisma.purchaseOrderLine.count({ where: { analyticAccountId: id } }),
      prisma.salesOrderLine.count({ where: { analyticAccountId: id } }),
      prisma.vendorBillLine.count({ where: { analyticAccountId: id } }),
      prisma.customerInvoiceLine.count({ where: { analyticAccountId: id } }),
      prisma.budgetLine.count({ where: { analyticAccountId: id } }),
    ]);

    return poLines === 0 && soLines === 0 && billLines === 0 && invoiceLines === 0 && budgetLines === 0;
  }

  async delete(id: string) {
    const account = await prisma.analyticAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Analytic account not found");
    }

    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new ConflictError("Cannot delete analytic account in use");
    }

    return prisma.analyticAccount.delete({
      where: { id },
    });
  }
}

export const analyticAccountService = new AnalyticAccountService();
