import { PrismaClient } from "@prisma/client";
import { ValidationError } from "../utils/errors";

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
  debtorsAccountId?: string;
  creditorsAccountId?: string;
}

export class CompanySettingsService {
  async get() {
    let settings = await prisma.companySettings.findFirst();

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: "My Company",
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
    if (input.fiscalYearStartMonth !== undefined) {
      if (input.fiscalYearStartMonth < 1 || input.fiscalYearStartMonth > 12) {
        throw new ValidationError("Fiscal year start month must be between 1 and 12");
      }
    }

    if (input.companyName !== undefined && !input.companyName.trim()) {
      throw new ValidationError("Company name cannot be empty");
    }

    const settings = await this.get();

    const updated = await prisma.companySettings.update({
      where: { id: settings.id },
      data: {
        companyName: input.companyName?.trim(),
        logo: input.logo,
        address: input.address?.trim(),
        baseCurrency: input.baseCurrency,
        fiscalYearStartMonth: input.fiscalYearStartMonth,
        poNumberPrefix: input.poNumberPrefix,
        billNumberPrefix: input.billNumberPrefix,
        soNumberPrefix: input.soNumberPrefix,
        invoiceNumberPrefix: input.invoiceNumberPrefix,
        jeNumberPrefix: input.jeNumberPrefix,
      },
    });

    return updated;
  }

  async getNextNumber(prefix: string, lastNumber: number): Promise<string> {
    const nextNumber = lastNumber + 1;
    return `${prefix}${String(nextNumber).padStart(5, "0")}`;
  }
}

export const companySettingsService = new CompanySettingsService();
