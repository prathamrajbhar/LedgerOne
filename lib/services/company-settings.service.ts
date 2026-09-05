/**
 * Company Settings Service
 * Manages company profile, currency, and document prefixes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface UpdateCompanySettingsInput {
  companyName?: string;
  logo?: string;
  address?: string;
  baseCurrency?: string;
  fiscalYearStartMonth?: number;
  poNumberPrefix?: string;
  billNumberPrefix?: string;
  soNumberPrefix?: string;
  invoiceNumberPrefix?: string;
  jeNumberPrefix?: string;
}

export class CompanySettingsService {
  async get() {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: "LedgerOne Enterprise",
          baseCurrency: "USD",
          fiscalYearStartMonth: 1,
          poNumberPrefix: "PO",
          billNumberPrefix: "BILL",
          soNumberPrefix: "SO",
          invoiceNumberPrefix: "INV",
          jeNumberPrefix: "JE",
        },
      });
    }
    return settings;
  }

  async update(input: UpdateCompanySettingsInput) {
    const existing = await this.get();
    return prisma.companySettings.update({
      where: { id: existing.id },
      data: input,
    });
  }
}

export const companySettingsService = new CompanySettingsService();
