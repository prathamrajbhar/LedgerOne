import {
  getDashboardKPIsAction,
  getMonthlyOverviewAction,
  getExpenseBreakdownAction,
  getRecentTransactionsAction,
  getInventoryStatusAction,
  getOutstandingPaymentsAction,
  getUserGreetingAction,
} from "@/app/actions/dashboard.actions";
import { resolveAccountingPeriod } from "@/lib/constants/accounting-periods";
import { DashboardClient } from "./dashboard-client";

interface DashboardPageProps {
  searchParams?: {
    period?: string;
    from?: string;
    to?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Resolve active accounting period from search parameters
  const periodInfo = resolveAccountingPeriod(
    searchParams?.period,
    searchParams?.from,
    searchParams?.to
  );

  const { startDate, endDate, label, range, start, end } = periodInfo;

  // Fetch all dashboard data in parallel
  const [
    kpis,
    monthlyOverview,
    expenseBreakdown,
    recentTransactions,
    inventoryStatus,
    outstandingPayments,
    userGreeting,
  ] = await Promise.all([
    getDashboardKPIsAction(start, end),
    getMonthlyOverviewAction(6),
    getExpenseBreakdownAction(start, end),
    getRecentTransactionsAction(10),
    getInventoryStatusAction(),
    getOutstandingPaymentsAction(),
    getUserGreetingAction(),
  ]);

  return (
    <DashboardClient
      kpis={kpis}
      monthlyOverview={monthlyOverview}
      expenseBreakdown={expenseBreakdown}
      recentTransactions={recentTransactions}
      inventoryStatus={inventoryStatus}
      outstandingPayments={outstandingPayments}
      userGreeting={userGreeting}
      periodLabel={label}
      periodRange={range}
    />
  );
}
