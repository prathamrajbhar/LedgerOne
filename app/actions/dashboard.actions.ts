"use server";

import {
  dashboardService,
  DashboardKPIs,
  MonthlyOverviewData,
  ExpenseBreakdownItem,
  RecentTransaction,
  InventoryStatus,
  OutstandingPayments,
} from "@/lib/services/dashboard.service";

export type {
  DashboardKPIs,
  MonthlyOverviewData,
  ExpenseBreakdownItem,
  RecentTransaction,
  InventoryStatus,
  OutstandingPayments,
};

/**
 * Get Dashboard KPIs with comparison to previous period
 */
export async function getDashboardKPIsAction(
  startDate: Date,
  endDate: Date
): Promise<DashboardKPIs> {
  try {
    return await dashboardService.getKPIs(startDate, endDate);
  } catch {
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
export async function getMonthlyOverviewAction(
  period: "6" | "12" | "ytd" | number = 6
): Promise<MonthlyOverviewData[]> {
  try {
    return await dashboardService.getMonthlyOverview(period);
  } catch {
    const fallbackList: MonthlyOverviewData[] = [];
    const count = typeof period === "number" ? period : 6;
    const today = new Date();
    for (let offset = count - 1; offset >= 0; offset--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      fallbackList.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        revenue: 0,
        expenses: 0,
        profit: 0,
      });
    }
    return fallbackList;
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
    return await dashboardService.getExpenseBreakdown(startDate, endDate);
  } catch {
    return [];
  }
}

/**
 * Get recent transactions from journal entries
 */
export async function getRecentTransactionsAction(
  limit: number = 10
): Promise<RecentTransaction[]> {
  try {
    return await dashboardService.getRecentTransactions(limit);
  } catch {
    return [];
  }
}

/**
 * Get inventory status
 */
export async function getInventoryStatusAction(): Promise<InventoryStatus> {
  try {
    return await dashboardService.getInventoryStatus();
  } catch {
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
    return await dashboardService.getOutstandingPayments();
  } catch {
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
export async function getUserGreetingAction(): Promise<{
  greeting: string;
  userName: string;
}> {
  try {
    return await dashboardService.getUserGreeting();
  } catch {
    return {
      greeting: "Good morning",
      userName: "Administrator",
    };
  }
}
