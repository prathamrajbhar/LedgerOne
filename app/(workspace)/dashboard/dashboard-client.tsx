"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getMonthlyOverviewAction,
  getExpenseBreakdownAction,
  type DashboardKPIs,
  type MonthlyOverviewData,
  type ExpenseBreakdownItem,
  type RecentTransaction,
  type InventoryStatus,
  type OutstandingPayments,
} from "@/app/actions/dashboard.actions";
import { DashboardKpiGrid } from "./components/dashboard-kpi-grid";
import {
  MonthlyOverviewChart,
  type ChartPeriod,
} from "./components/monthly-overview-chart";
import {
  ExpenseBreakdownChart,
  type ExpensePeriod,
} from "./components/expense-breakdown-chart";
import { QuickActionsCard } from "./components/quick-actions-card";
import { InventoryStatusCard } from "./components/inventory-status-card";
import { OutstandingPaymentsCard } from "./components/outstanding-payments-card";
import { RecentTransactionsTable } from "./components/recent-transactions-table";
import {
  getExpenseDateRange,
  exportRecentTransactionsToCSV,
} from "./lib/dashboard-helpers";

interface DashboardClientProps {
  kpis: DashboardKPIs;
  monthlyOverview: MonthlyOverviewData[];
  expenseBreakdown: ExpenseBreakdownItem[];
  recentTransactions: RecentTransaction[];
  inventoryStatus: InventoryStatus;
  outstandingPayments: OutstandingPayments;
  userGreeting: { greeting: string; userName: string };
  periodLabel?: string;
  periodRange?: string;
}

const quickActionRoutes: Record<string, string> = {
  invoice: "/invoices/new",
  expense: "/expenses/new",
  payment: "/payments/new",
  customer: "/contacts/new?type=CUSTOMER",
  supplier: "/contacts/new?type=VENDOR",
  product: "/products/new",
};

export function DashboardClient({
  kpis,
  monthlyOverview,
  expenseBreakdown,
  recentTransactions,
  inventoryStatus,
  outstandingPayments,
  userGreeting,
  periodLabel = "September 2026 (Current)",
  periodRange = "01 Sep 2026 - 30 Sep 2026",
}: DashboardClientProps) {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = React.useState<ChartPeriod>("Last 6 Months");
  const [expensePeriod, setExpensePeriod] = React.useState<ExpensePeriod>("This Month");

  const [overviewData, setOverviewData] = React.useState<MonthlyOverviewData[]>(monthlyOverview);
  const [isOverviewLoading, startOverviewTransition] = React.useTransition();

  const [breakdownData, setBreakdownData] = React.useState<ExpenseBreakdownItem[]>(expenseBreakdown);
  const [isBreakdownLoading, startBreakdownTransition] = React.useTransition();

  React.useEffect(() => {
    setOverviewData(monthlyOverview);
  }, [monthlyOverview]);

  React.useEffect(() => {
    setBreakdownData(expenseBreakdown);
  }, [expenseBreakdown]);

  const handleChartPeriodChange = (selected: ChartPeriod) => {
    setChartPeriod(selected);
    startOverviewTransition(async () => {
      try {
        const periodParam =
          selected === "Last 12 Months" ? 12 : selected === "Year to Date" ? "ytd" : 6;
        const trendData = await getMonthlyOverviewAction(periodParam);
        setOverviewData(trendData);
      } catch {
        toast.error("Failed to update overview chart data");
      }
    });
  };

  const handleExpensePeriodChange = (selected: ExpensePeriod) => {
    setExpensePeriod(selected);
    startBreakdownTransition(async () => {
      try {
        const { startDate, endDate } = getExpenseDateRange(selected);
        const items = await getExpenseBreakdownAction(startDate, endDate);
        setBreakdownData(items);
      } catch {
        toast.error("Failed to update expense breakdown data");
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {userGreeting.greeting}, {userGreeting.userName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your business for{" "}
            <span className="font-semibold text-foreground">{periodLabel}</span>{" "}
            <span className="text-xs text-muted-foreground/80">({periodRange})</span>.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs italic text-muted-foreground">
            &quot;Accurate records. A stronger tomorrow.&quot;
          </p>
          <p className="text-[11px] text-muted-foreground/80">— LedgerOne</p>
        </div>
      </div>

      {/* 2. Financial KPI Cards */}
      <DashboardKpiGrid kpis={kpis} />

      {/* 3. Middle Row: Revenue & Expense Overview + Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <MonthlyOverviewChart
          overviewData={overviewData}
          chartPeriod={chartPeriod}
          isOverviewLoading={isOverviewLoading}
          onPeriodChange={handleChartPeriodChange}
        />
        <ExpenseBreakdownChart
          breakdownData={breakdownData}
          expensePeriod={expensePeriod}
          isBreakdownLoading={isBreakdownLoading}
          onExpensePeriodChange={handleExpensePeriodChange}
        />
      </div>

      {/* 4. Third Row: Quick Actions, Inventory Status, Outstanding Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickActionsCard
          onSelectAction={(action) => {
            if (action && quickActionRoutes[action]) {
              router.push(quickActionRoutes[action]);
            }
          }}
        />
        <InventoryStatusCard inventoryStatus={inventoryStatus} />
        <OutstandingPaymentsCard outstandingPayments={outstandingPayments} />
      </div>

      {/* 5. Bottom Row: Recent Transactions Table */}
      <RecentTransactionsTable
        recentTransactions={recentTransactions}
        onExport={() => exportRecentTransactionsToCSV(recentTransactions)}
      />
    </div>
  );
}
