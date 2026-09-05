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
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getDashboardKPIsAction,
  getMonthlyOverviewAction,
  getExpenseBreakdownAction,
  getRecentTransactionsAction,
  getInventoryStatusAction,
  getOutstandingPaymentsAction,
  getUserGreetingAction,
} from "@/app/actions/dashboard.actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // Calculate date ranges
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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
    getDashboardKPIsAction(startOfMonth, endOfMonth),
    getMonthlyOverviewAction(6),
    getExpenseBreakdownAction(startOfMonth, endOfMonth),
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
    />
  );
}
