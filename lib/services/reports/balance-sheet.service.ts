import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

export interface BalanceSheetParams {
  asOfDate?: Date;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
}

export interface BalanceSheetReport {
  asOfDate: Date;
  assets: {
    accounts: AccountBalance[];
    total: number;
  };
  liabilities: {
    accounts: AccountBalance[];
    total: number;
  };
  equity: {
    accounts: AccountBalance[];
    total: number;
  };
  balanceCheck: {
    assetsTotal: number;
    liabilitiesAndEquityTotal: number;
    isBalanced: boolean;
  };
}

export class BalanceSheetService {
  async generate(params: BalanceSheetParams = {}): Promise<BalanceSheetReport> {
    const asOfDate = params.asOfDate || new Date();

    const journalEntryLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          accountingDate: {
            lte: asOfDate,
          },
          status: "POSTED",
        },
      },
      include: {
        account: true,
      },
    });

    const accountBalances = new Map<string, AccountBalance>();

    for (const line of journalEntryLines) {
      const accountId = line.accountId;
      const accountName = line.account.name;
      const accountType = line.account.type;

      if (!accountBalances.has(accountId)) {
        accountBalances.set(accountId, {
          accountId,
          accountName,
          accountType,
          balance: 0,
        });
      }

      const accountBalance = accountBalances.get(accountId)!;

      const debit = Number(line.debit);
      const credit = Number(line.credit);

      if (accountType === AccountType.ASSET || accountType === AccountType.BANK || accountType === AccountType.CASH) {
        accountBalance.balance += debit - credit;
      } else if (accountType === AccountType.LIABILITY || accountType === AccountType.CAPITAL) {
        accountBalance.balance += credit - debit;
      } else {
        accountBalance.balance += debit - credit;
      }
    }

    const assets: AccountBalance[] = [];
    const liabilities: AccountBalance[] = [];
    const equity: AccountBalance[] = [];

    for (const balance of accountBalances.values()) {
      if (balance.accountType === AccountType.ASSET ||
          balance.accountType === AccountType.BANK ||
          balance.accountType === AccountType.CASH) {
        assets.push(balance);
      } else if (balance.accountType === AccountType.LIABILITY) {
        liabilities.push(balance);
      } else if (balance.accountType === AccountType.CAPITAL) {
        equity.push(balance);
      }
    }

    assets.sort((a, b) => a.accountName.localeCompare(b.accountName));
    liabilities.sort((a, b) => a.accountName.localeCompare(b.accountName));
    equity.sort((a, b) => a.accountName.localeCompare(b.accountName));

    const assetsTotal = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const liabilitiesTotal = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const equityTotal = equity.reduce((sum, acc) => sum + acc.balance, 0);

    const liabilitiesAndEquityTotal = liabilitiesTotal + equityTotal;
    const isBalanced = Math.abs(assetsTotal - liabilitiesAndEquityTotal) < 0.01;

    return {
      asOfDate,
      assets: {
        accounts: assets,
        total: assetsTotal,
      },
      liabilities: {
        accounts: liabilities,
        total: liabilitiesTotal,
      },
      equity: {
        accounts: equity,
        total: equityTotal,
      },
      balanceCheck: {
        assetsTotal,
        liabilitiesAndEquityTotal,
        isBalanced,
      },
    };
  }

  async getProfitLoss(startDate: Date, endDate: Date) {
    const journalEntryLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          accountingDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "POSTED",
        },
      },
      include: {
        account: true,
      },
    });

    const accountBalances = new Map<string, AccountBalance>();

    for (const line of journalEntryLines) {
      const accountId = line.accountId;
      const accountName = line.account.name;
      const accountType = line.account.type;

      if (accountType !== AccountType.INCOME &&
          accountType !== AccountType.EXPENSES &&
          accountType !== AccountType.OTHER_EXPENSES) {
        continue;
      }

      if (!accountBalances.has(accountId)) {
        accountBalances.set(accountId, {
          accountId,
          accountName,
          accountType,
          balance: 0,
        });
      }

      const accountBalance = accountBalances.get(accountId)!;

      const debit = Number(line.debit);
      const credit = Number(line.credit);

      if (accountType === AccountType.INCOME) {
        accountBalance.balance += credit - debit;
      } else {
        accountBalance.balance += debit - credit;
      }
    }

    const income: AccountBalance[] = [];
    const expenses: AccountBalance[] = [];

    for (const balance of accountBalances.values()) {
      if (balance.accountType === AccountType.INCOME) {
        income.push(balance);
      } else if (balance.accountType === AccountType.EXPENSES ||
                 balance.accountType === AccountType.OTHER_EXPENSES) {
        expenses.push(balance);
      }
    }

    const incomeTotal = income.reduce((sum, acc) => sum + acc.balance, 0);
    const expensesTotal = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const netProfit = incomeTotal - expensesTotal;

    return {
      startDate,
      endDate,
      income: {
        accounts: income,
        total: incomeTotal,
      },
      expenses: {
        accounts: expenses,
        total: expensesTotal,
      },
      netProfit,
    };
  }
}

export const balanceSheetService = new BalanceSheetService();
