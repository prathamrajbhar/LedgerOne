import { PrismaClient, AccountType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateAccountInput {
  name: string;
  type: AccountType;
}

export interface UpdateAccountInput {
  id: string;
  name?: string;
}

export interface ListAccountsParams {
  search?: string;
  type?: AccountType;
  includeArchived?: boolean;
}

export class ChartOfAccountsService {
  async create(input: CreateAccountInput) {
    if (!input.name?.trim()) {
      throw new ValidationError("Account name is required");
    }

    const existing = await prisma.chartOfAccount.findUnique({
      where: { name: input.name.trim() },
    });

    if (existing) {
      throw new ConflictError("Account name already exists");
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        name: input.name.trim(),
        type: input.type,
      },
    });

    return account;
  }

  async update(input: UpdateAccountInput) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id: input.id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (input.name) {
      const existing = await prisma.chartOfAccount.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new ConflictError("Account name already exists");
      }
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
      },
    });

    return updated;
  }

  async findById(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    return account;
  }

  async list(params: ListAccountsParams) {
    const { search, type, includeArchived = false } = params;

    const where: Prisma.ChartOfAccountWhereInput = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(type && { type }),
      ...(!includeArchived && { isArchived: false }),
    };

    const accounts = await prisma.chartOfAccount.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return accounts;
  }

  async getSelectableAccounts(type?: AccountType) {
    const where: Prisma.ChartOfAccountWhereInput = {
      isArchived: false,
      ...(type && { type }),
    };

    return prisma.chartOfAccount.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async archive(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.isArchived) {
      throw new ConflictError("Account is already archived");
    }

    return prisma.chartOfAccount.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async restore(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (!account.isArchived) {
      throw new ConflictError("Account is not archived");
    }

    return prisma.chartOfAccount.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async canDelete(id: string): Promise<boolean> {
    const journalLines = await prisma.journalEntryLine.count({
      where: { accountId: id },
    });

    const journalsUsingAsDefault = await prisma.journal.count({
      where: { defaultAccountId: id },
    });

    return journalLines === 0 && journalsUsingAsDefault === 0;
  }
}

export const chartOfAccountsService = new ChartOfAccountsService();
