import { prisma } from "@/lib/prisma";
import { AccountType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";



export interface CreateAccountInput {
  code: string;
  name: string;
  type: AccountType;
}

export interface UpdateAccountInput {
  id: string;
  code?: string;
  name?: string;
}

export interface ListAccountsParams {
  search?: string;
  type?: AccountType;
  includeArchived?: boolean;
}

export class ChartOfAccountsService {
  async create(input: CreateAccountInput) {
    if (!input.code?.trim()) {
      throw new ValidationError("Account code is required");
    }

    if (!input.name?.trim()) {
      throw new ValidationError("Account name is required");
    }

    // Check if code already exists
    const existingCode = await prisma.chartOfAccount.findUnique({
      where: { code: input.code.trim() },
    });

    if (existingCode) {
      throw new ConflictError("Account code already exists");
    }

    // Check if name already exists
    const existingName = await prisma.chartOfAccount.findUnique({
      where: { name: input.name.trim() },
    });

    if (existingName) {
      throw new ConflictError("Account name already exists");
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        code: input.code.trim(),
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

    // Check if code already exists (if updating code)
    if (input.code) {
      const existingCode = await prisma.chartOfAccount.findFirst({
        where: {
          code: input.code.trim(),
          NOT: { id: input.id },
        },
      });

      if (existingCode) {
        throw new ConflictError("Account code already exists");
      }
    }

    // Check if name already exists (if updating name)
    if (input.name) {
      const existingName = await prisma.chartOfAccount.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existingName) {
        throw new ConflictError("Account name already exists");
      }
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id: input.id },
      data: {
        code: input.code?.trim(),
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
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
      ...(!includeArchived && { isArchived: false }),
    };

    const accounts = await prisma.chartOfAccount.findMany({
      where,
      orderBy: { code: "asc" },
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
