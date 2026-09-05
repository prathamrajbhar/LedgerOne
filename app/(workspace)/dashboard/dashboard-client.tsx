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
import type {
  DashboardKPIs,
  MonthlyOverviewData,
  ExpenseBreakdownItem,
  RecentTransaction,
  InventoryStatus,
  OutstandingPayments,
} from "@/app/actions/dashboard.actions";

interface DashboardClientProps {
  kpis: DashboardKPIs;
  monthlyOverview: MonthlyOverviewData[];
  expenseBreakdown: ExpenseBreakdownItem[];
  recentTransactions: RecentTransaction[];
  inventoryStatus: InventoryStatus;
  outstandingPayments: OutstandingPayments;
  userGreeting: { greeting: string; userName: string };
}

export function DashboardClient({
  kpis,
  monthlyOverview,
  expenseBreakdown,
  recentTransactions,
  inventoryStatus,
  outstandingPayments,
  userGreeting,
}: DashboardClientProps) {
  const [chartPeriod, setChartPeriod] = React.useState("Last 6 Months");
  const [expensePeriod, setExpensePeriod] = React.useState("This Month");
  const [filterCategory, setFilterCategory] = React.useState("All Categories");
  const [filterStatus, setFilterStatus] = React.useState("All Statuses");
  const [searchQuery, setSearchQuery] = React.useState("");

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
      (filterStatus === "Paid" && (tx.status === "PAID" || tx.status === "RECEIVED")) ||
      (filterStatus === "Pending" && tx.status === "PENDING");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate total expenses for donut chart center
  const totalExpensesBreakdown = expenseBreakdown.reduce((sum, item) => {
    // Extract numeric value from amount string (₹1,23,456 -> 123456)
    const numericValue = parseFloat(item.amount.replace(/[₹,]/g, ""));
    return sum + numericValue;
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
            Here&apos;s what&apos;s happening with your business today.
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
              <span className="text-muted-foreground font-normal">vs prev month</span>
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
              <span className="text-muted-foreground font-normal">vs prev month</span>
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
              <span className="text-muted-foreground font-normal">vs prev month</span>
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
        <Card className="lg:col-span-8 p-5 bg-white shadow-card">
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
                  <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                    <span>{chartPeriod}</span>
                    <span className="text-muted-foreground">▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setChartPeriod("Last 6 Months")}>
                    Last 6 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChartPeriod("Last 12 Months")}>
                    Last 12 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChartPeriod("Year to Date")}>
                    Year to Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

        {/* Expense Breakdown (Donut + Legend) */}
        <Card className="lg:col-span-4 p-5 bg-white shadow-card flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Expense Breakdown
            </CardTitle>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                  <span>{expensePeriod}</span>
                  <span className="text-muted-foreground">▾</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setExpensePeriod("This Month")}>
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExpensePeriod("Last Month")}>
                  Last Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExpensePeriod("This Quarter")}>
                  This Quarter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {expenseBreakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              No expense data available
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 pt-4">
              {/* Donut Chart with Center Amount */}
              <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    ₹{totalExpensesBreakdown.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Total Expenses
                  </span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="w-full flex-1 space-y-1.5 pl-2">
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground text-[11px] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground text-[11px]">
                      {item.value}%
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
            <Link
              href="/invoices"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Create Invoice
              </span>
            </Link>

            <Link
              href="/expenses"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
                <Receipt className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Record Expense
              </span>
            </Link>

            <Link
              href="/payments"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Payment
              </span>
            </Link>

            <Link
              href="/contacts/new"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Customer
              </span>
            </Link>

            <Link
              href="/contacts/new?type=VENDOR"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0F7] text-navy group-hover:bg-navy group-hover:text-white transition-colors mb-2">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Supplier
              </span>
            </Link>

            <Link
              href="/products/new"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
                <PackagePlus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                Add Product
              </span>
            </Link>
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
              href="/invoices"
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
              href="/invoices"
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
              href="/contacts"
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
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
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
                <button className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
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
    </div>
  );
}
