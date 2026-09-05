import { PrismaClient, JournalType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateJournalInput {
  name: string;
  type: JournalType;
  defaultAccountId: string;
}

export interface UpdateJournalInput {
  id: string;
  name?: string;
  defaultAccountId?: string;
}

export interface ListJournalsParams {
  search?: string;
  type?: JournalType;
}

export class JournalService {
  async create(input: CreateJournalInput) {
    if (!input.name?.trim()) {
      throw new ValidationError("Journal name is required");
    }

    const existing = await prisma.journal.findUnique({
      where: { name: input.name.trim() },
    });

    if (existing) {
      throw new ConflictError("Journal name already exists");
    }

    const account = await prisma.chartOfAccount.findUnique({
      where: { id: input.defaultAccountId },
    });

    if (!account) {
      throw new ValidationError("Default account not found");
    }

    const journal = await prisma.journal.create({
      data: {
        name: input.name.trim(),
        type: input.type,
        defaultAccountId: input.defaultAccountId,
      },
      include: {
        defaultAccount: true,
      },
    });

    return journal;
  }

  async update(input: UpdateJournalInput) {
    const journal = await prisma.journal.findUnique({
      where: { id: input.id },
    });

    if (!journal) {
      throw new NotFoundError("Journal not found");
    }

    if (input.name) {
      const existing = await prisma.journal.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new ConflictError("Journal name already exists");
      }
    }

    if (input.defaultAccountId) {
      const account = await prisma.chartOfAccount.findUnique({
        where: { id: input.defaultAccountId },
      });

      if (!account) {
        throw new ValidationError("Default account not found");
      }
    }

    const updated = await prisma.journal.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        defaultAccountId: input.defaultAccountId,
      },
      include: {
        defaultAccount: true,
      },
    });

    return updated;
  }

  async findById(id: string) {
    const journal = await prisma.journal.findUnique({
      where: { id },
      include: {
        defaultAccount: true,
      },
    });

    if (!journal) {
      throw new NotFoundError("Journal not found");
    }

    return journal;
  }

  async list(params: ListJournalsParams) {
    const { search, type } = params;

    const where: Prisma.JournalWhereInput = {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(type && { type }),
    };

    const journals = await prisma.journal.findMany({
      where,
      include: {
        defaultAccount: true,
      },
      orderBy: { name: "asc" },
    });

    return journals;
  }

  async canDelete(id: string): Promise<boolean> {
    const journalEntries = await prisma.journalEntry.count({
      where: { journalId: id },
    });

    return journalEntries === 0;
  }

  async delete(id: string) {
    const journal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      throw new NotFoundError("Journal not found");
    }

    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new ConflictError("Cannot delete journal with existing journal entries");
    }

    return prisma.journal.delete({
      where: { id },
    });
  }
}

export const journalService = new JournalService();
