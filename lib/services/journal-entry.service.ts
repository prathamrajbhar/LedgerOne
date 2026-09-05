/**
 * Journal Entry Service
 * Handles manual and auto-generated journal entries with balance enforcement
 */

import { PrismaClient, JournalEntryStatus, JournalEntrySource, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { UnbalancedEntryError, ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateJournalEntryInput {
  journalId: string;
  accountingDate: Date;
  lines: JournalEntryLineInput[];
  userId: string;
}

export interface JournalEntryLineInput {
  accountId: string;
  partnerId?: string;
  debit: Decimal;
  credit: Decimal;
}

export interface AutoGenerateEntryInput {
  source: JournalEntrySource;
  journalId: string;
  accountingDate: Date;
  lines: JournalEntryLineInput[];
  sourceDocumentId: string;
  userId: string;
}

export class JournalEntryService {
  /**
   * Create manual journal entry
   */
  async createManual(input: CreateJournalEntryInput) {
    // Validate not in closed fiscal period
    await this.validateNotInClosedPeriod(input.accountingDate);

    // Validate balance
    const { totalDebit, totalCredit } = this.calculateTotals(input.lines);

    if (!totalDebit.equals(totalCredit)) {
      throw new UnbalancedEntryError(
        `Journal Entry is unbalanced: Debit ${totalDebit.toString()} ≠ Credit ${totalCredit.toString()}`
      );
    }

    return prisma.$transaction(async (tx) => {
      // Generate entry number
      const entryNumber = await this.generateEntryNumber();

      // Create entry
      const entry = await tx.journalEntry.create({
        data: {
          entryNumber,
          journalId: input.journalId,
          accountingDate: input.accountingDate,
          status: JournalEntryStatus.DRAFT,
          source: JournalEntrySource.MANUAL,
          totalDebit,
          totalCredit,
          createdById: input.userId,
          lines: {
            create: input.lines.map((line) => ({
              accountId: line.accountId,
              partnerId: line.partnerId,
              debit: line.debit,
              credit: line.credit,
            })),
          },
        },
        include: {
          lines: {
            include: {
              account: true,
              partner: true,
            },
          },
        },
      });

      return entry;
    });
  }

  /**
   * Auto-generate journal entry from business transaction
   */
  async autoGenerate(input: AutoGenerateEntryInput) {
    // Validate not in closed fiscal period
    await this.validateNotInClosedPeriod(input.accountingDate);

    // Validate balance
    const { totalDebit, totalCredit } = this.calculateTotals(input.lines);

    if (!totalDebit.equals(totalCredit)) {
      throw new UnbalancedEntryError(
        `Auto-generated Journal Entry is unbalanced: Debit ${totalDebit.toString()} ≠ Credit ${totalCredit.toString()}`
      );
    }

    return prisma.$transaction(async (tx) => {
      // Generate entry number
      const entryNumber = await this.generateEntryNumber();

      // Create entry with source document link
      const data: Prisma.JournalEntryUncheckedCreateInput = {
        entryNumber,
        journalId: input.journalId,
        accountingDate: input.accountingDate,
        status: JournalEntryStatus.POSTED, // Auto entries are posted immediately
        source: input.source,
        totalDebit,
        totalCredit,
        createdById: input.userId,
        lines: {
          create: input.lines.map((line) => ({
            accountId: line.accountId,
            partnerId: line.partnerId,
            debit: line.debit,
            credit: line.credit,
          })),
        },
      };

      // Link to source document
      switch (input.source) {
        case JournalEntrySource.VENDOR_BILL:
          data.vendorBillId = input.sourceDocumentId;
          break;
        case JournalEntrySource.CUSTOMER_INVOICE:
          data.invoiceId = input.sourceDocumentId;
          break;
        case JournalEntrySource.BILL_PAYMENT:
          data.billPaymentId = input.sourceDocumentId;
          break;
        case JournalEntrySource.INVOICE_PAYMENT:
          data.invoicePaymentId = input.sourceDocumentId;
          break;
      }

      const entry = await tx.journalEntry.create({
        data,
        include: {
          lines: {
            include: {
              account: true,
              partner: true,
            },
          },
        },
      });

      return entry;
    });
  }

  /**
   * Post a draft journal entry
   */
  async post(entryId: string) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true },
    });

    if (!entry) {
      throw new NotFoundError("Journal Entry not found");
    }

    if (entry.status === JournalEntryStatus.POSTED) {
      throw new ValidationError("Journal Entry is already posted");
    }

    // Validate not in closed fiscal period
    await this.validateNotInClosedPeriod(entry.accountingDate);

    // Verify balance
    if (!entry.totalDebit.equals(entry.totalCredit)) {
      throw new UnbalancedEntryError("Cannot post unbalanced entry");
    }

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: JournalEntryStatus.POSTED },
      include: {
        lines: {
          include: {
            account: true,
            partner: true,
          },
        },
      },
    });
  }

  /**
   * Reset entry to draft (for corrections)
   */
  async resetToDraft(entryId: string) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundError("Journal Entry not found");
    }

    // Validate not in closed fiscal period
    await this.validateNotInClosedPeriod(entry.accountingDate);

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: JournalEntryStatus.DRAFT },
    });
  }

  /**
   * Delete a draft journal entry
   */
  async delete(entryId: string) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundError("Journal Entry not found");
    }

    if (entry.status === JournalEntryStatus.POSTED) {
      throw new ValidationError("Cannot delete posted journal entries. Reset to draft first.");
    }

    // Validate not in closed fiscal period
    await this.validateNotInClosedPeriod(entry.accountingDate);

    return prisma.journalEntry.delete({
      where: { id: entryId },
    });
  }

  /**
   * Update a draft journal entry
   */
  async update(entryId: string, input: CreateJournalEntryInput) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundError("Journal Entry not found");
    }

    if (entry.status === JournalEntryStatus.POSTED) {
      throw new ValidationError("Cannot update posted journal entries. Reset to draft first.");
    }

    // Validate not in closed fiscal period (check both old and new dates)
    await this.validateNotInClosedPeriod(entry.accountingDate);
    await this.validateNotInClosedPeriod(input.accountingDate);

    // Validate balance
    const { totalDebit, totalCredit } = this.calculateTotals(input.lines);

    if (!totalDebit.equals(totalCredit)) {
      throw new UnbalancedEntryError(
        `Journal Entry is unbalanced: Debit ${totalDebit.toString()} ≠ Credit ${totalCredit.toString()}`
      );
    }

    return prisma.$transaction(async (tx) => {
      // Delete existing lines
      await tx.journalEntryLine.deleteMany({
        where: { journalEntryId: entryId },
      });

      // Update entry with new data
      return tx.journalEntry.update({
        where: { id: entryId },
        data: {
          journalId: input.journalId,
          accountingDate: input.accountingDate,
          totalDebit,
          totalCredit,
          lines: {
            create: input.lines.map((line) => ({
              accountId: line.accountId,
              partnerId: line.partnerId,
              debit: line.debit,
              credit: line.credit,
            })),
          },
        },
        include: {
          lines: {
            include: {
              account: true,
              partner: true,
            },
          },
        },
      });
    });
  }

  // Private helpers

  /**
   * Validate that a journal entry accounting date is not in a closed fiscal period
   */
  private async validateNotInClosedPeriod(accountingDate: Date): Promise<void> {
    const settings = await prisma.companySettings.findFirst();

    if (settings?.fiscalPeriodClosedUntil) {
      // Compare dates at day level (ignoring time component)
      const closedUntil = new Date(settings.fiscalPeriodClosedUntil);
      closedUntil.setHours(23, 59, 59, 999); // End of day

      const entryDate = new Date(accountingDate);
      entryDate.setHours(0, 0, 0, 0); // Start of day

      if (entryDate <= closedUntil) {
        const formattedDate = settings.fiscalPeriodClosedUntil.toISOString().split('T')[0];
        throw new ValidationError(
          `Cannot modify journal entries in closed fiscal periods. The fiscal period is closed until ${formattedDate}. Please contact your administrator to reopen the period if corrections are needed.`
        );
      }
    }
  }

  private calculateTotals(lines: JournalEntryLineInput[]): {
    totalDebit: Decimal;
    totalCredit: Decimal;
  } {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of lines) {
      totalDebit = totalDebit.add(line.debit);
      totalCredit = totalCredit.add(line.credit);
    }

    return { totalDebit, totalCredit };
  }

  /**
   * List journal entries with filtering and pagination
   */
  async list(params: {
    search?: string;
    status?: JournalEntryStatus;
    source?: JournalEntrySource;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Search by entry number or source document references
    if (params.search) {
      where.OR = [
        { entryNumber: { contains: params.search, mode: "insensitive" } },
        { vendorBill: { billNumber: { contains: params.search, mode: "insensitive" } } },
        { invoice: { invoiceNumber: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    // Filter by status
    if (params.status) {
      where.status = params.status;
    }

    // Filter by source
    if (params.source) {
      where.source = params.source;
    }

    // Filter by date range
    if (params.dateFrom || params.dateTo) {
      where.accountingDate = {};
      if (params.dateFrom) {
        where.accountingDate.gte = params.dateFrom;
      }
      if (params.dateTo) {
        where.accountingDate.lte = params.dateTo;
      }
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          journal: true,
          vendorBill: {
            include: {
              vendor: true,
            },
          },
          invoice: {
            include: {
              customer: true,
            },
          },
          billPayment: {
            include: {
              bill: {
                include: {
                  vendor: true,
                },
              },
            },
          },
          invoicePayment: {
            include: {
              invoice: {
                include: {
                  customer: true,
                },
              },
            },
          },
          lines: {
            include: {
              account: true,
              partner: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          accountingDate: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get a single journal entry by ID with all details
   */
  async getById(entryId: string) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: {
        journal: true,
        vendorBill: {
          include: {
            vendor: true,
          },
        },
        invoice: {
          include: {
            customer: true,
          },
        },
        billPayment: {
          include: {
            bill: {
              include: {
                vendor: true,
              },
            },
          },
        },
        invoicePayment: {
          include: {
            invoice: {
              include: {
                customer: true,
              },
            },
          },
        },
        lines: {
          include: {
            account: true,
            partner: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundError("Journal Entry not found");
    }

    return entry;
  }

  private async generateEntryNumber(): Promise<string> {
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.jeNumberPrefix || "JE";
    const count = await prisma.journalEntry.count();
    return `${prefix}${String(count + 1).padStart(6, "0")}`;
  }
}

export const journalEntryService = new JournalEntryService();
