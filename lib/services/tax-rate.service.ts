import { PrismaClient, TaxApplicability, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateTaxRateInput {
  name: string;
  percentage: number;
  applicability: TaxApplicability;
}

export interface UpdateTaxRateInput {
  id: string;
  name?: string;
  percentage?: number;
  applicability?: TaxApplicability;
}

export interface ListTaxRatesParams {
  search?: string;
  applicability?: TaxApplicability;
}

export class TaxRateService {
  async create(input: CreateTaxRateInput) {
    if (!input.name?.trim()) {
      throw new ValidationError("Tax rate name is required");
    }

    if (input.percentage < 0 || input.percentage > 100) {
      throw new ValidationError("Tax percentage must be between 0 and 100");
    }

    const existing = await prisma.taxRate.findUnique({
      where: { name: input.name.trim() },
    });

    if (existing) {
      throw new ConflictError("Tax rate name already exists");
    }

    const taxRate = await prisma.taxRate.create({
      data: {
        name: input.name.trim(),
        percentage: new Prisma.Decimal(input.percentage),
        applicability: input.applicability,
      },
    });

    return taxRate;
  }

  async update(input: UpdateTaxRateInput) {
    const taxRate = await prisma.taxRate.findUnique({
      where: { id: input.id },
    });

    if (!taxRate) {
      throw new NotFoundError("Tax rate not found");
    }

    if (input.percentage !== undefined && (input.percentage < 0 || input.percentage > 100)) {
      throw new ValidationError("Tax percentage must be between 0 and 100");
    }

    if (input.name) {
      const existing = await prisma.taxRate.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new ConflictError("Tax rate name already exists");
      }
    }

    const updated = await prisma.taxRate.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        percentage: input.percentage ? new Prisma.Decimal(input.percentage) : undefined,
        applicability: input.applicability,
      },
    });

    return updated;
  }

  async findById(id: string) {
    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!taxRate) {
      throw new NotFoundError("Tax rate not found");
    }

    return taxRate;
  }

  async list(params: ListTaxRatesParams) {
    const { search, applicability } = params;

    const where: Prisma.TaxRateWhereInput = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(applicability && { applicability }),
    };

    const taxRates = await prisma.taxRate.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return taxRates;
  }

  async canDelete(id: string): Promise<boolean> {
    const [soLines, invoiceLines] = await Promise.all([
      prisma.salesOrderLine.count({ where: { taxRateId: id } }),
      prisma.customerInvoiceLine.count({ where: { taxRateId: id } }),
    ]);

    return soLines === 0 && invoiceLines === 0;
  }

  async delete(id: string) {
    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!taxRate) {
      throw new NotFoundError("Tax rate not found");
    }

    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new ConflictError("Cannot delete tax rate in use");
    }

    return prisma.taxRate.delete({
      where: { id },
    });
  }
}

export const taxRateService = new TaxRateService();
