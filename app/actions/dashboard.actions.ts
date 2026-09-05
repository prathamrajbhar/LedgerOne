"use server";

import { DocumentStatus, PaymentStatus, AccountType, JournalEntryStatus, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

/**
 * Get Dashboard KPIs with comparison to previous period
 */
export async function getDashboardKPIsAction(
  startDate: Date,
  endDate: Date
): Promise<DashboardKPIs> {
  try {
    // Calculate previous period dates
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    // Total Revenue: Sum of confirmed customer invoices
    const [currentRevenue, previousRevenue] = await Promise.all([
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
    ]);

    const totalRevenue = Number(currentRevenue._sum.total || 0);
    const prevRevenue = Number(previousRevenue._sum.total || 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Total Expenses: Sum of confirmed vendor bills
    const [currentExpenses, previousExpenses] = await Promise.all([
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

    const totalExpenses = Number(currentExpenses._sum.total || 0);
    const prevExpenses = Number(previousExpenses._sum.total || 0);
    const expensesChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    // Net Profit
    const netProfit = totalRevenue - totalExpenses;
    const prevProfit = prevRevenue - prevExpenses;
    const profitChange = prevProfit !== 0 ? ((netProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;

    // Accounts Receivable: Outstanding invoices
    const receivables = await prisma.customerInvoice.aggregate({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
      },
      _sum: { amountDue: true },
    });

    const accountsReceivable = Number(receivables._sum.amountDue || 0);

    // Accounts Payable: Outstanding bills
    const payables = await prisma.vendorBill.aggregate({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
      },
      _sum: { amountDue: true },
    });

    const accountsPayable = Number(payables._sum.amountDue || 0);

    // Cash Balance: Sum of Bank and Cash account balances from journal entries
    const cashAccounts = await prisma.chartOfAccount.findMany({
      where: { type: { in: [AccountType.BANK, AccountType.CASH] } },
      select: { id: true },
    });

    const cashAccountIds = cashAccounts.map((acc) => acc.id);

    // Calculate balance for cash accounts (debit - credit)
    const cashEntries = await prisma.journalEntryLine.aggregate({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: { status: JournalEntryStatus.POSTED },
      },
      _sum: { debit: true, credit: true },
    });

    const cashBalance = Number(cashEntries._sum.debit || 0) - Number(cashEntries._sum.credit || 0);

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
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      accountsReceivable: 0,
      accountsPayable: 0,
      cashBalance: 0,
      revenueChange: 0,
      expensesChange: 0,
      profitChange: 0,
      receivableChange: 0,
      payableChange: 0,
      cashChange: 0,
    };
  }
}

/**
 * Get monthly overview data for revenue vs expenses chart
 */
export async function getMonthlyOverviewAction(months: number = 6): Promise<MonthlyOverviewData[]> {
  const result: MonthlyOverviewData[] = [];
  const today = new Date();

  try {
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });

      // Revenue for this month
      const revenueData = await prisma.customerInvoice.aggregate({
        where: {
          status: DocumentStatus.CONFIRMED,
          invoiceDate: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
      });

      // Expenses for this month
      const expensesData = await prisma.vendorBill.aggregate({
        where: {
          status: DocumentStatus.CONFIRMED,
          billDate: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
      });

      const revenue = Number(revenueData._sum.total || 0);
      const expenses = Number(expensesData._sum.total || 0);
      const profit = revenue - expenses;

      result.push({
        month: monthName,
        revenue,
        expenses,
        profit,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching monthly overview:", error);
    // Return empty 6-month array so chart renders cleanly without crashing
    const fallback: MonthlyOverviewData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      fallback.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        revenue: 0,
        expenses: 0,
        profit: 0,
      });
    }
    return fallback;
  }
}

/**
 * Get expense breakdown by analytic account
 */
export async function getExpenseBreakdownAction(
  startDate: Date,
  endDate: Date
): Promise<ExpenseBreakdownItem[]> {
  try {
    // Get all expense-related bills
    const bills = await prisma.vendorBill.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        billDate: { gte: startDate, lte: endDate },
      },
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
      },
    });

    // Group by analytic account
    const expenseMap = new Map<string, number>();
    let totalExpenses = 0;

    for (const bill of bills) {
      for (const line of bill.lines) {
        const analyticName = line.analyticAccount?.name || "Uncategorized";
        const lineTotal = Number(line.lineTotal);
        expenseMap.set(analyticName, (expenseMap.get(analyticName) || 0) + lineTotal);
        totalExpenses += lineTotal;
      }
    }

    // Convert to array and calculate percentages
    const colors = ["#16324F", "#167C80", "#2E9E96", "#4EA8DE", "#7209B7", "#8E9AAF", "#CBD5E1"];
    const breakdown: ExpenseBreakdownItem[] = [];

    let colorIndex = 0;
    for (const [name, amount] of Array.from(expenseMap.entries()).sort((a, b) => b[1] - a[1])) {
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      breakdown.push({
        name,
        value: parseFloat(percentage.toFixed(1)),
        amount: `₹${amount.toLocaleString("en-IN")}`,
        color: colors[colorIndex % colors.length],
      });
      colorIndex++;
    }

    return breakdown;
  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    return [];
  }
}

/**
 * Get recent transactions from journal entries
 */
export async function getRecentTransactionsAction(limit: number = 10): Promise<RecentTransaction[]> {
  try {
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

      // Determine transaction type and party
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
        date: entry.accountingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        code,
        party,
        category,
        amount: `₹${Number(entry.totalDebit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status,
      };
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

/**
 * Get inventory status
 */
export async function getInventoryStatusAction(): Promise<InventoryStatus> {
  try {
    const totalProducts = await prisma.product.count({
      where: { isArchived: false },
    });

    return {
      totalProducts,
      lowStock: 0,
      inStock: totalProducts,
      outOfStock: 0,
    };
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    return {
      totalProducts: 0,
      lowStock: 0,
      inStock: 0,
      outOfStock: 0,
    };
  }
}

/**
 * Get outstanding payments summary
 */
export async function getOutstandingPaymentsAction(): Promise<OutstandingPayments> {
  try {
    const today = new Date();

    // Overdue Invoices
    const overdueInvoices = await prisma.customerInvoice.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        dueDate: { lt: today },
      },
      select: { amountDue: true },
    });

    // Pending Invoices (not overdue)
    const pendingInvoices = await prisma.customerInvoice.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        dueDate: { gte: today },
      },
      select: { amountDue: true },
    });

    // Total Receivables
    const allReceivables = await prisma.customerInvoice.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
      },
      select: { amountDue: true, customerId: true },
    });

    // Total Payables
    const allPayables = await prisma.vendorBill.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
      },
      select: { amountDue: true, vendorId: true },
    });

    // Count unique customers and vendors
    const uniqueCustomers = new Set(allReceivables.map((r) => r.customerId)).size;
    const uniqueVendors = new Set(allPayables.map((p) => p.vendorId)).size;

    return {
      overdueInvoices: {
        count: overdueInvoices.length,
        amount: overdueInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0),
      },
      pendingInvoices: {
        count: pendingInvoices.length,
        amount: pendingInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0),
      },
      receivables: {
        count: uniqueCustomers,
        amount: allReceivables.reduce((sum, inv) => sum + Number(inv.amountDue), 0),
      },
      payables: {
        count: uniqueVendors,
        amount: allPayables.reduce((sum, bill) => sum + Number(bill.amountDue), 0),
      },
    };
  } catch (error) {
    console.error("Error fetching outstanding payments:", error);
    return {
      overdueInvoices: { count: 0, amount: 0 },
      pendingInvoices: { count: 0, amount: 0 },
      receivables: { count: 0, amount: 0 },
      payables: { count: 0, amount: 0 },
    };
  }
}

/**
 * Get current user greeting data
 */
export async function getUserGreetingAction(): Promise<{ greeting: string; userName: string }> {
  let user = null;
  try {
    user = await getCurrentUser();
    if (!user) {
      const dbUser = await prisma.user.findFirst({
        where: {
          role: { in: [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT] },
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      });
      if (dbUser) {
        user = { name: dbUser.name || dbUser.loginId };
      }
    }
  } catch {
    user = null;
  }

  const hour = new Date().getHours();

  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  return {
    greeting,
    userName: user?.name || "Administrator",
  };
}
