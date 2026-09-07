import { toast } from "sonner";
import type { ExpensePeriod } from "../components/expense-breakdown-chart";
import type { RecentTransaction } from "@/app/actions/dashboard.actions";

export function getExpenseDateRange(selected: ExpensePeriod): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  if (selected === "This Month") {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  if (selected === "Last Month") {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  if (selected === "This Quarter") {
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
    return {
      startDate: new Date(qYear, qStartMonth, 1, 0, 0, 0, 0),
      endDate: new Date(qYear, qEndMonth + 1, 0, 23, 59, 59, 999),
    };
  }

  return {
    startDate: new Date(2020, 0, 1, 0, 0, 0, 0),
    endDate: new Date(2099, 11, 31, 23, 59, 59, 999),
  };
}

export function exportRecentTransactionsToCSV(
  recentTransactions: RecentTransaction[]
): void {
  if (recentTransactions.length === 0) {
    toast.error("No transactions to export");
    return;
  }

  const headers = ["Date", "Transaction ID", "Party", "Category", "Amount", "Status"];
  const rows = recentTransactions.map((tx) => [
    `"${tx.date.replace(/"/g, '""')}"`,
    `"${tx.code.replace(/"/g, '""')}"`,
    `"${tx.party.replace(/"/g, '""')}"`,
    `"${tx.category.replace(/"/g, '""')}"`,
    `"${tx.amount.replace(/"/g, '""')}"`,
    `"${tx.status.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `recent-transactions-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Recent transactions exported to CSV successfully.");
}
