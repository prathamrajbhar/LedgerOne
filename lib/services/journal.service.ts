import { PrismaClient, JournalType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateJournalInput {
  code: string;
  name: string;
  type: JournalType;
  defaultAccountId: string;
}

export interface UpdateJournalInput {
  id: string;
  code?: string;
  name?: string;
  defaultAccountId?: string;
}

export interface ListJournalsParams {
  search?: string;
  type?: JournalType;
}

export class JournalService {
  async create(input: CreateJournalInput) {
    if (!input.code?.trim()) {
      throw new ValidationError("Journal code is required");
    }

    if (!input.name?.trim()) {
      throw new ValidationError("Journal name is required");
    }

    // Check if code already exists
    const existingCode = await prisma.journal.findUnique({
      where: { code: input.code.trim().toUpperCase() },
    });

    if (existingCode) {
      throw new ConflictError("Journal code already exists");
    }

    // Check if name already exists
    const existingName = await prisma.journal.findUnique({
      where: { name: input.name.trim() },
    });

    if (existingName) {
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
        code: input.code.trim().toUpperCase(),
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

    // Check if code already exists (if updating code)
    if (input.code) {
      const existingCode = await prisma.journal.findFirst({
        where: {
          code: input.code.trim().toUpperCase(),
          NOT: { id: input.id },
        },
      });

      if (existingCode) {
        throw new ConflictError("Journal code already exists");
      }
    }

    // Check if name already exists (if updating name)
    if (input.name) {
      const existingName = await prisma.journal.findFirst({
        where: {
          name: input.name.trim(),
          NOT: { id: input.id },
        },
      });

      if (existingName) {
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
        code: input.code?.trim().toUpperCase(),
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
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
    };

    const journals = await prisma.journal.findMany({
      where,
      include: {
        defaultAccount: true,
      },
      orderBy: { code: "asc" },
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
