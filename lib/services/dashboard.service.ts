import {
  DocumentStatus,
  PaymentStatus,
  AccountType,
  JournalEntryStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
  receivableChange: number;
  payableChange: number;
  cashChange: number;
}

export interface MonthlyOverviewData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  value: number;
  amount: string;
  rawAmount: number;
  color: string;
}

export interface RecentTransaction {
  id: string;
  date: string;
  code: string;
  party: string;
  category: string;
  amount: string;
  status: string;
}

export interface InventoryStatus {
  totalProducts: number;
  lowStock: number;
  inStock: number;
  outOfStock: number;
}

export interface OutstandingPayments {
  overdueInvoices: { count: number; amount: number };
  pendingInvoices: { count: number; amount: number };
  receivables: { count: number; amount: number };
  payables: { count: number; amount: number };
}

export class DashboardService {
  /**
   * Calculate dashboard KPIs with period-over-period comparison
   */
  async getKPIs(startDate: Date, endDate: Date): Promise<DashboardKPIs> {
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    const [currentRevenueAgg, previousRevenueAgg, currentExpensesAgg, previousExpensesAgg] =
      await Promise.all([
        prisma.customerInvoice.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            invoiceDate: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
        prisma.customerInvoice.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            invoiceDate: { gte: prevStartDate, lte: prevEndDate },
          },
          _sum: { total: true },
        }),
        prisma.vendorBill.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            billDate: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
        prisma.vendorBill.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            billDate: { gte: prevStartDate, lte: prevEndDate },
          },
          _sum: { total: true },
        }),
      ]);

    const totalRevenue = Number(currentRevenueAgg._sum.total || 0);
    const prevRevenue = Number(previousRevenueAgg._sum.total || 0);
    const revenueChange =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalExpenses = Number(currentExpensesAgg._sum.total || 0);
    const prevExpenses = Number(previousExpensesAgg._sum.total || 0);
    const expensesChange =
      prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    const netProfit = totalRevenue - totalExpenses;
    const prevProfit = prevRevenue - prevExpenses;
    const profitChange =
      prevProfit !== 0 ? ((netProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;

    const [receivablesAgg, payablesAgg, cashAccounts] = await Promise.all([
      prisma.customerInvoice.aggregate({
        where: {
          status: DocumentStatus.CONFIRMED,
          paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        },
        _sum: { amountDue: true },
      }),
      prisma.vendorBill.aggregate({
        where: {
          status: DocumentStatus.CONFIRMED,
          paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        },
        _sum: { amountDue: true },
      }),
      prisma.chartOfAccount.findMany({
        where: { type: { in: [AccountType.BANK, AccountType.CASH] } },
        select: { id: true },
      }),
    ]);

    const accountsReceivable = Number(receivablesAgg._sum.amountDue || 0);
    const accountsPayable = Number(payablesAgg._sum.amountDue || 0);

    const cashAccountIds = cashAccounts.map((account) => account.id);
    const cashEntries = await prisma.journalEntryLine.aggregate({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: { status: JournalEntryStatus.POSTED },
      },
      _sum: { debit: true, credit: true },
    });

    const cashBalance =
      Number(cashEntries._sum.debit || 0) - Number(cashEntries._sum.credit || 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      accountsReceivable,
      accountsPayable,
      cashBalance,
      revenueChange,
      expensesChange,
      profitChange,
      receivableChange: 0,
      payableChange: 0,
      cashChange: 0,
    };
  }

  /**
   * Get monthly revenue and expense trends
   */
  async getMonthlyOverview(
    period: "6" | "12" | "ytd" | number = 6
  ): Promise<MonthlyOverviewData[]> {
    const overviewList: MonthlyOverviewData[] = [];
    const today = new Date();

    let monthsCount = typeof period === "number" ? period : period === "12" ? 12 : 6;
    if (period === "ytd") {
      const fyStartMonth = 3;
      const curMonth = today.getMonth();
      monthsCount =
        curMonth >= fyStartMonth
          ? curMonth - fyStartMonth + 1
          : 12 - fyStartMonth + curMonth + 1;
    }

    for (let monthOffset = monthsCount - 1; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });

      const [revenueAgg, expensesAgg] = await Promise.all([
        prisma.customerInvoice.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            invoiceDate: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
        prisma.vendorBill.aggregate({
          where: {
            status: DocumentStatus.CONFIRMED,
            billDate: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
      ]);

      const revenue = Number(revenueAgg._sum.total || 0);
      const expenses = Number(expensesAgg._sum.total || 0);
      const profit = revenue - expenses;

      overviewList.push({
        month: monthName,
        revenue,
        expenses,
        profit,
      });
    }

    return overviewList;
  }

  /**
   * Get expense distribution by category / analytic account
   */
  async getExpenseBreakdown(
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseBreakdownItem[]> {
    const [bills, manualExpenseEntries] = await Promise.all([
      prisma.vendorBill.findMany({
        where: {
          status: DocumentStatus.CONFIRMED,
          billDate: { gte: startDate, lte: endDate },
        },
        include: {
          lines: {
            include: {
              analyticAccount: true,
              product: true,
            },
          },
        },
        take: 500,
      }),
      prisma.journalEntry.findMany({
        where: {
          source: "MANUAL",
          status: JournalEntryStatus.POSTED,
          accountingDate: { gte: startDate, lte: endDate },
        },
        include: {
          lines: {
            include: {
              account: true,
              partner: true,
            },
          },
        },
        take: 500,
      }),
    ]);

    const expenseMap = new Map<string, number>();
    let totalExpenses = 0;

    for (const bill of bills) {
      for (const line of bill.lines) {
        const categoryName =
          line.analyticAccount?.name || line.product?.name || "Materials & Supplies";
        const lineTotal = Number(line.lineTotal);
        expenseMap.set(categoryName, (expenseMap.get(categoryName) || 0) + lineTotal);
        totalExpenses += lineTotal;
      }
    }

    for (const entry of manualExpenseEntries) {
      for (const line of entry.lines) {
        if (
          Number(line.debit) > 0 &&
          (line.account.type === "EXPENSES" || line.account.type === "OTHER_EXPENSES")
        ) {
          const category =
            line.partner?.name || line.account.name || "Operating Expenses";
          const debitAmount = Number(line.debit);
          expenseMap.set(category, (expenseMap.get(category) || 0) + debitAmount);
          totalExpenses += debitAmount;
        }
      }
    }

    const palette = [
      "#16324F",
      "#167C80",
      "#2E9E96",
      "#4EA8DE",
      "#7209B7",
      "#8E9AAF",
      "#F4A261",
      "#2A9D8F",
      "#E76F51",
    ];

    const breakdownItems: ExpenseBreakdownItem[] = [];
    let colorCursor = 0;

    for (const [name, amount] of Array.from(expenseMap.entries()).sort(
      (entryA, entryB) => entryB[1] - entryA[1]
    )) {
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      breakdownItems.push({
        name,
        value: parseFloat(percentage.toFixed(1)),
        amount: `₹${amount.toLocaleString("en-IN")}`,
        rawAmount: amount,
        color: palette[colorCursor % palette.length],
      });
      colorCursor++;
    }

    return breakdownItems;
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const entries = await prisma.journalEntry.findMany({
      where: { status: JournalEntryStatus.POSTED },
      include: {
        invoice: { include: { customer: true } },
        vendorBill: { include: { vendor: true } },
        invoicePayment: { include: { invoice: { include: { customer: true } } } },
        billPayment: true,
      },
      orderBy: { accountingDate: "desc" },
      take: limit,
    });

    return entries.map((entry) => {
      let code = entry.entryNumber;
      let party = "";
      let category = "Journal Entry";
      let status = "POSTED";

      if (entry.invoice) {
        code = entry.invoice.invoiceNumber;
        party = `Customer: ${entry.invoice.customer.name}`;
        category = "Sales";
        status = entry.invoice.paymentStatus;
      } else if (entry.vendorBill) {
        code = entry.vendorBill.billNumber;
        party = `Supplier: ${entry.vendorBill.vendor.name}`;
        category = "Purchase";
        status = entry.vendorBill.paymentStatus;
      } else if (entry.invoicePayment) {
        party = `Payment from ${entry.invoicePayment.invoice.customer.name}`;
        category = "Payment";
        status = "RECEIVED";
      } else if (entry.billPayment) {
        party = `Bill Payment`;
        category = "Payment";
        status = "PAID";
      }

      return {
        id: entry.id,
        date: entry.accountingDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        code,
        party,
        category,
        amount: `₹${Number(entry.totalDebit).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        status,
      };
    });
  }

  /**
   * Get inventory stock levels
   */
  async getInventoryStatus(): Promise<InventoryStatus> {
    const totalProducts = await prisma.product.count({
      where: { isArchived: false },
    });

    return {
      totalProducts,
      lowStock: 0,
      inStock: totalProducts,
      outOfStock: 0,
    };
  }

  /**
   * Get outstanding invoices and bills breakdown
   */
  async getOutstandingPayments(): Promise<OutstandingPayments> {
    const today = new Date();

    const [overdueInvoices, pendingInvoices, allReceivables, allPayables] =
      await Promise.all([
        prisma.customerInvoice.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
            dueDate: { lt: today },
          },
          select: { amountDue: true },
        }),
        prisma.customerInvoice.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
            dueDate: { gte: today },
          },
          select: { amountDue: true },
        }),
        prisma.customerInvoice.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
          },
          select: { amountDue: true, customerId: true },
        }),
        prisma.vendorBill.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
          },
          select: { amountDue: true, vendorId: true },
        }),
      ]);

    const uniqueCustomers = new Set(allReceivables.map((item) => item.customerId)).size;
    const uniqueVendors = new Set(allPayables.map((item) => item.vendorId)).size;

    return {
      overdueInvoices: {
        count: overdueInvoices.length,
        amount: overdueInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.amountDue),
          0
        ),
      },
      pendingInvoices: {
        count: pendingInvoices.length,
        amount: pendingInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.amountDue),
          0
        ),
      },
      receivables: {
        count: uniqueCustomers,
        amount: allReceivables.reduce(
          (sum, invoice) => sum + Number(invoice.amountDue),
          0
        ),
      },
      payables: {
        count: uniqueVendors,
        amount: allPayables.reduce((sum, bill) => sum + Number(bill.amountDue), 0),
      },
    };
  }

  /**
   * Get greeting and current user display name
   */
  async getUserGreeting(): Promise<{ greeting: string; userName: string }> {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
      if (!currentUser) {
        const fallbackUser = await prisma.user.findFirst({
          where: {
            role: { in: [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT] },
            isActive: true,
          },
          orderBy: { createdAt: "asc" },
        });
        if (fallbackUser) {
          currentUser = { name: fallbackUser.name || fallbackUser.loginId };
        }
      }
    } catch {
      currentUser = null;
    }

    const currentHour = new Date().getHours();
    let greeting = "Good morning";
    if (currentHour >= 12 && currentHour < 17) {
      greeting = "Good afternoon";
    } else if (currentHour >= 17) {
      greeting = "Good evening";
    }

    return {
      greeting,
      userName: currentUser?.name || "Administrator",
    };
  }
}

export const dashboardService = new DashboardService();
