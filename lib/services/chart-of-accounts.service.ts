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
      isArchived: includeArchived,
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

  async getUsageDetails(id: string) {
    const [journalLines, journals] = await Promise.all([
      prisma.journalEntryLine.findMany({
        where: { accountId: id },
        include: { journalEntry: true },
        take: 15,
      }),
      prisma.journal.findMany({
        where: { defaultAccountId: id },
        take: 5,
      }),
    ]);

    const dependencies = [
      ...journalLines.map((jl) => ({
        id: jl.journalEntryId,
        lineId: jl.id,
        type: "JOURNAL_ENTRY" as const,
        typeName: "Journal Entry",
        reference: jl.journalEntry.entryNumber,
        date: jl.journalEntry.accountingDate.toISOString(),
        status: jl.journalEntry.status,
        amount: Number(Number(jl.debit) > 0 ? jl.debit : jl.credit),
        viewUrl: "/journal-entries",
        canDeleteDirectly: jl.journalEntry.status === "DRAFT",
      })),
      ...journals.map((j) => ({
        id: j.id,
        type: "JOURNAL_DEFAULT" as const,
        typeName: "Journal Default Account",
        reference: `${j.name} (${j.code})`,
        date: new Date().toISOString(),
        status: "CONFIGURED",
        viewUrl: "/journals",
        canDeleteDirectly: false,
      })),
    ];

    return {
      canDelete: dependencies.length === 0,
      totalReferences: dependencies.length,
      breakdown: {
        journalEntries: journalLines.length,
        defaultJournals: journals.length,
      },
      dependencies,
    };
  }

  async deleteDependency(type: string, id: string, lineId?: string) {
    if (type === "JOURNAL_ENTRY") {
      if (lineId) {
        await prisma.journalEntryLine.delete({ where: { id: lineId } });
      } else {
        await prisma.journalEntry.delete({ where: { id } });
      }
    }
  }
}

export const chartOfAccountsService = new ChartOfAccountsService();
