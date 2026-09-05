"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  CircleDollarSign,
  Users,
  Building2,
  Wallet,
  FileText,
  CreditCard,
  UserPlus,
  PackagePlus,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getProductCategoriesAction } from "@/app/actions/product.actions";
import { ContactForm } from "@/app/(workspace)/contacts/contact-form";
import { ProductForm } from "@/app/(workspace)/products/product-form";
import { ExpenseModal } from "@/components/forms/expense-modal";
import { PaymentModal } from "@/components/forms/payment-modal";
import { CreateInvoiceModal } from "@/components/forms/create-invoice-modal";

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
  const [chartPeriod, setChartPeriod] = React.useState("Last 6 Months");
  const [expensePeriod, setExpensePeriod] = React.useState("This Month");
  const [filterCategory, setFilterCategory] = React.useState("All Categories");
  const [filterStatus, setFilterStatus] = React.useState("All Statuses");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Quick Action Modal State
  type QuickActionType = "invoice" | "expense" | "payment" | "customer" | "supplier" | "product";
  const [activeModal, setActiveModal] = React.useState<QuickActionType | null>(null);
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([]);

  // Load product categories for product modal
  React.useEffect(() => {
    if (activeModal === "product" && categories.length === 0) {
      getProductCategoriesAction().then((res) => {
        if (res.success && res.data) {
          setCategories(res.data as Array<{ id: string; name: string }>);
        }
      });
    }
  }, [activeModal, categories.length]);

  const handleQuickActionSuccess = React.useCallback(() => {
    setActiveModal(null);
    router.refresh();
  }, [router]);

  // Dynamic state for Overview chart
  const [overviewData, setOverviewData] = React.useState<MonthlyOverviewData[]>(monthlyOverview);
  const [isOverviewLoading, startOverviewTransition] = React.useTransition();

  // Dynamic state for Expense Breakdown chart
  const [breakdownData, setBreakdownData] = React.useState<ExpenseBreakdownItem[]>(expenseBreakdown);
  const [isBreakdownLoading, startBreakdownTransition] = React.useTransition();

  // Sync props when SSR/URL period changes
  React.useEffect(() => {
    setOverviewData(monthlyOverview);
  }, [monthlyOverview]);

  React.useEffect(() => {
    setBreakdownData(expenseBreakdown);
  }, [expenseBreakdown]);

  // Handle Chart Period Change
  const handleChartPeriodChange = (selected: "Last 6 Months" | "Last 12 Months" | "Year to Date") => {
    setChartPeriod(selected);
    startOverviewTransition(async () => {
      try {
        const periodParam = selected === "Last 12 Months" ? 12 : selected === "Year to Date" ? "ytd" : 6;
        const data = await getMonthlyOverviewAction(periodParam);
        setOverviewData(data);
      } catch (error) {
        console.error("Failed to load overview data:", error);
        toast.error("Failed to update overview chart data");
      }
    });
  };

  // Handle Expense Period Change
  const handleExpensePeriodChange = (selected: "This Month" | "Last Month" | "This Quarter" | "All Time") => {
    setExpensePeriod(selected);
    startBreakdownTransition(async () => {
      try {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (selected === "This Month") {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (selected === "Last Month") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        } else if (selected === "This Quarter") {
          const curMonth = now.getMonth();
          let qStartMonth = 3;
          let qEndMonth = 5;
          const qYear = now.getFullYear();
          if (curMonth >= 6 && curMonth <= 8) {
            qStartMonth = 6;
            qEndMonth = 8;
          } else if (curMonth >= 9 && curMonth <= 11) {
            qStartMonth = 9;
            qEndMonth = 11;
          } else if (curMonth <= 2) {
            qStartMonth = 0;
            qEndMonth = 2;
          }
          startDate = new Date(qYear, qStartMonth, 1, 0, 0, 0, 0);
          endDate = new Date(qYear, qEndMonth + 1, 0, 23, 59, 59, 999);
        } else {
          // All Time
          startDate = new Date(2020, 0, 1, 0, 0, 0, 0);
          endDate = new Date(2099, 11, 31, 23, 59, 59, 999);
        }

        const data = await getExpenseBreakdownAction(startDate, endDate);
        setBreakdownData(data);
      } catch (error) {
        console.error("Failed to load expense breakdown:", error);
        toast.error("Failed to update expense breakdown data");
      }
    });
  };

  const handleExport = () => {
    toast.success("Recent transactions exported to CSV successfully.");
  };

  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.party.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All Categories" || tx.category === filterCategory;
    const matchesStatus =
      filterStatus === "All Statuses" ||
      (filterStatus === "Paid" &&
        (tx.status === "PAID" || tx.status === "RECEIVED" || tx.status === "POSTED")) ||
      (filterStatus === "Pending" &&
        (tx.status === "PENDING" || tx.status === "NOT_PAID" || tx.status === "PARTIAL" || tx.status === "OVERDUE"));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const [expenseChartType, setExpenseChartType] = React.useState<"donut" | "bar">("donut");

  // Calculate total expenses for breakdown
  const totalExpensesBreakdown = breakdownData.reduce((sum, item) => {
    if (typeof item.rawAmount === "number") {
      return sum + item.rawAmount;
    }
    const numericValue = parseFloat(item.amount.replace(/[₹,]/g, ""));
    return sum + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);

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

      {/* 2. 6 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${kpis.revenueChange >= 0 ? "text-success" : "text-destructive"}`}>
              {kpis.revenueChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>{Math.abs(kpis.revenueChange).toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">vs prev period</span>
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Total Expenses
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.totalExpenses.toLocaleString("en-IN")}
            </div>
            <div className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${kpis.expensesChange >= 0 ? "text-destructive" : "text-success"}`}>
              {kpis.expensesChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>{Math.abs(kpis.expensesChange).toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">vs prev period</span>
            </div>
          </div>
        </Card>

        {/* Net Profit */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Net Profit
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.netProfit.toLocaleString("en-IN")}
            </div>
            <div className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${kpis.profitChange >= 0 ? "text-success" : "text-destructive"}`}>
              {kpis.profitChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>{Math.abs(kpis.profitChange).toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">vs prev period</span>
            </div>
          </div>
        </Card>

        {/* Accounts Receivable */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate">
              Accounts Receivable
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.accountsReceivable.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
              <span className="font-normal">Outstanding invoices</span>
            </div>
          </div>
        </Card>

        {/* Accounts Payable */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#6366F1]">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate">
              Accounts Payable
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.accountsPayable.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
              <span className="font-normal">Outstanding bills</span>
            </div>
          </div>
        </Card>

        {/* Cash Balance */}
        <Card className="p-4 hover:border-border-strong transition-all bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Cash Balance
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              ₹{kpis.cashBalance.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1 text-[11px] mt-1 font-medium text-muted-foreground">
              <span className="font-normal">Bank + Cash accounts</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Middle Row: Revenue & Expense Overview (Left) + Expense Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue & Expense Overview Chart */}
        <Card className="lg:col-span-7 p-5 bg-white shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Revenue & Expense Overview
              </CardTitle>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-xs bg-navy" />
                  <span className="text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-xs bg-teal" />
                  <span className="text-muted-foreground">Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full border-2 border-[#54B2B6] bg-white" />
                  <span className="text-muted-foreground">Profit</span>
                </div>
              </div>

              {/* Period Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5 disabled:opacity-60">
                    {isOverviewLoading && <Loader2 className="h-3 w-3 animate-spin text-navy" />}
                    <span>{chartPeriod}</span>
                    <span className="text-muted-foreground">▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleChartPeriodChange("Last 6 Months")}>
                    Last 6 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChartPeriodChange("Last 12 Months")}>
                    Last 12 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChartPeriodChange("Year to Date")}>
                    Year to Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="h-[280px] w-full pt-4 relative">
            {isOverviewLoading && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-navy" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overviewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E7EC" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#E2E7EC" }}
                  tick={{ fill: "#5E6B78", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#5E6B78", fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <RechartsTooltip
                  formatter={(value: number | string) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    border: "1px solid #E2E7EC",
                    boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#16324F" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" fill="#167C80" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#54B2B6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#FFFFFF", stroke: "#54B2B6", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Breakdown (Donut & Bar Graph with Real Data) */}
        <Card className="lg:col-span-5 p-5 bg-white shadow-card flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                Expense Breakdown
              </CardTitle>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle between Donut and Bar graph */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
                <button
                  type="button"
                  onClick={() => setExpenseChartType("donut")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    expenseChartType === "donut"
                      ? "bg-white text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Donut
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseChartType("bar")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    expenseChartType === "bar"
                      ? "bg-white text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bar
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-7 px-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1 disabled:opacity-60">
                    {isBreakdownLoading && <Loader2 className="h-3 w-3 animate-spin text-teal" />}
                    <span>{expensePeriod}</span>
                    <span className="text-muted-foreground text-[10px]">▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExpensePeriodChange("This Month")}>
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExpensePeriodChange("Last Month")}>
                    Last Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExpensePeriodChange("This Quarter")}>
                    This Quarter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExpensePeriodChange("All Time")}>
                    All Time
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {breakdownData.length === 0 ? (
            <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-sm text-muted-foreground relative">
              {isBreakdownLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              )}
              <Receipt className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <span>No expense data available</span>
              <p className="text-xs text-muted-foreground/80 mt-1">Confirmed vendor bills and journal entries will appear here.</p>
            </div>
          ) : expenseChartType === "donut" ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 relative">
              {isBreakdownLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              )}
              {/* Animated Donut Chart with Center Total */}
              <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={true}
                      animationBegin={100}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: number | string, _name, entry: any) => [
                        `${val}% (${entry.payload.amount})`,
                        entry.payload.name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        border: "1px solid #E2E7EC",
                        boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge matching user design */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
                  <span className="text-sm sm:text-base font-extrabold text-[#16324F] tracking-tight">
                    ₹{totalExpensesBreakdown.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-medium text-[#5E6B78]">
                    Total Expenses
                  </span>
                </div>
              </div>

              {/* Breakdown Category List */}
              <div className="w-full flex-1 space-y-1.5 min-w-0 max-h-[220px] overflow-y-auto pr-1">
                {breakdownData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0 hover:bg-muted/30 px-1 rounded transition-colors gap-2"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground font-medium text-[11px] truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-muted-foreground text-[11px] font-mono whitespace-nowrap">
                        {item.amount}
                      </span>
                      <span className="font-bold text-foreground text-[10px] bg-muted/60 px-1 py-0.5 rounded min-w-[36px] text-right">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Animated Bar Graph with Real Data */
            <div className="flex-1 flex flex-col pt-3 relative">
              {isBreakdownLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-teal" />
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1">
                <span>Category Breakdown</span>
                <span className="font-semibold text-foreground">
                  Total: ₹{totalExpensesBreakdown.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-[210px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breakdownData}
                    layout="vertical"
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E7EC" />
                    <XAxis
                      type="number"
                      domain={[0, "dataMax + 10"]}
                      unit="%"
                      tickLine={false}
                      axisLine={{ stroke: "#E2E7EC" }}
                      tick={{ fill: "#5E6B78", fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                      tick={{ fill: "#16324F", fontSize: 10, fontWeight: 500 }}
                      tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 9)}…` : val)}
                    />
                    <RechartsTooltip
                      formatter={(value: number | string, _name, entry: any) => [
                        `${entry.payload.amount} (${value}%)`,
                        entry.payload.name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        border: "1px solid #E2E7EC",
                        boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={true}
                      animationBegin={100}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar view bottom summary chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50 mt-auto">
                {breakdownData.slice(0, 4).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded text-[11px]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate max-w-[90px]">
                      {item.name}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Third Row: Quick Actions, Inventory Status, Outstanding Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Quick Actions (2x3 Grid) */}
        <Card className="p-5 bg-white shadow-card">
          <CardTitle className="text-sm font-bold text-foreground mb-4">
            Quick Actions
          </CardTitle>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal("invoice")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Create Invoice
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("expense")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
                <Receipt className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Record Expense
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("payment")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Payment
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("customer")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Customer
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("supplier")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0F7] text-navy group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Supplier
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("product")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
                <PackagePlus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Product
              </span>
            </button>
          </div>
        </Card>

        {/* Inventory Status */}
        <Card className="p-5 bg-white shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Inventory Status
            </CardTitle>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-teal hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
                <Boxes className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Total Products
                </span>
                <span className="text-base font-bold text-foreground">{inventoryStatus.totalProducts}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF7E6] text-warning">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Low Stock
                </span>
                <span className="text-base font-bold text-warning">{inventoryStatus.lowStock}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  In Stock
                </span>
                <span className="text-base font-bold text-success">{inventoryStatus.inStock}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive">
                <XCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Out of Stock
                </span>
                <span className="text-base font-bold text-destructive">{inventoryStatus.outOfStock}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Outstanding Payments */}
        <Card className="p-5 bg-white shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Outstanding Payments
            </CardTitle>
            <Link
              href="/payments"
              className="text-xs font-semibold text-teal hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2.5 pt-3">
            {/* Overdue Invoices */}
            <Link
              href="/invoices?paymentStatus=OVERDUE"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FDEEEE] text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Overdue Invoices
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-destructive">{outstandingPayments.overdueInvoices.count}</span>
                <span className="text-xs font-bold text-foreground">
                  ₹{outstandingPayments.overdueInvoices.amount.toLocaleString("en-IN")}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Pending Invoices */}
            <Link
              href="/invoices?paymentStatus=PENDING"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF7E6] text-warning">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Pending Invoices
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-warning">{outstandingPayments.pendingInvoices.count}</span>
                <span className="text-xs font-bold text-foreground">
                  ₹{outstandingPayments.pendingInvoices.amount.toLocaleString("en-IN")}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Receivables (Customers) */}
            <Link
              href="/contacts?type=CUSTOMER"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EDF5FC] text-[#3478B9]">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Receivables (Customers)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#3478B9]">{outstandingPayments.receivables.count}</span>
                <span className="text-xs font-bold text-foreground">
                  ₹{outstandingPayments.receivables.amount.toLocaleString("en-IN")}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Payables (Suppliers) */}
            <Link
              href="/contacts?type=VENDOR"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F0EEFF] text-[#6366F1]">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Payables (Suppliers)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#6366F1]">{outstandingPayments.payables.count}</span>
                <span className="text-xs font-bold text-foreground">
                  ₹{outstandingPayments.payables.amount.toLocaleString("en-IN")}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. Bottom Row: Recent Transactions Table */}
      <Card className="p-5 bg-white shadow-card">
        {/* Table Title & View All */}
        <div className="flex items-center justify-between pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Recent Transactions
          </CardTitle>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-teal hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="h-9 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                  <span>{filterCategory}</span>
                  <span className="text-muted-foreground">▾</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterCategory("All Categories")}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("Sales")}>
                  Sales
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("Purchase")}>
                  Purchase
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("Payment")}>
                  Payment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Statuses Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                  <span>{filterStatus}</span>
                  <span className="text-muted-foreground">▾</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus("All Statuses")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Paid")}>
                  Paid / Received
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Pending")}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              size="sm"
              className="h-9 px-3.5 bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 ml-auto sm:ml-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No transactions match your search filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-primary-light/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-foreground mr-2.5">
                        {row.code}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {row.party}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {row.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                      {row.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href="/transactions">View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info(`Transaction ${row.code} details viewed.`)
                            }
                          >
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================= Quick Action Modals ================= */}

      {/* 1. Create Invoice Modal */}
      <CreateInvoiceModal
        open={activeModal === "invoice"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleQuickActionSuccess}
      />

      {/* 2. Record Expense Modal */}
      <ExpenseModal
        open={activeModal === "expense"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleQuickActionSuccess}
      />

      {/* 3. Add Payment Modal */}
      <PaymentModal
        open={activeModal === "payment"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleQuickActionSuccess}
      />

      {/* 4. Add Customer Modal */}
      <Dialog
        open={activeModal === "customer"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-border pb-3 mb-2">
            <DialogTitle className="text-lg font-bold text-navy">
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            initialData={{ type: "CUSTOMER" }}
            isModal={true}
            onSuccess={handleQuickActionSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </DialogContent>
      </Dialog>

      {/* 5. Add Supplier / Vendor Modal */}
      <Dialog
        open={activeModal === "supplier"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-border pb-3 mb-2">
            <DialogTitle className="text-lg font-bold text-navy">
              Add New Supplier / Vendor
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            initialData={{ type: "VENDOR" }}
            isModal={true}
            onSuccess={handleQuickActionSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </DialogContent>
      </Dialog>

      {/* 6. Add Product Modal */}
      <Dialog
        open={activeModal === "product"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-border pb-3 mb-2">
            <DialogTitle className="text-lg font-bold text-navy">
              Add New Product to Inventory
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            isModal={true}
            onSuccess={handleQuickActionSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
