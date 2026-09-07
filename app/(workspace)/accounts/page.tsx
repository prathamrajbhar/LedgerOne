"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AccountsTable, AccountItem } from "./accounts-table";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { toast } from "sonner";
import { getChartOfAccountsAction } from "@/app/actions/master-data.actions";
import { AccountType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState<AccountItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  const loadAccounts = React.useCallback(async () => {
    try {
      const result = await getChartOfAccountsAction({
        search: search || undefined,
        type: typeFilter !== "ALL" ? (typeFilter as AccountType) : undefined,
        includeArchived: statusFilter === "ARCHIVED",
      });
      if (result.success && result.data) {
        setAccounts(result.data as AccountItem[]);
      } else {
        toast.error(result.error || "Failed to load accounts");
      }
    } catch {
      toast.error("Failed to load accounts");
    }
  }, [statusFilter, search, typeFilter]);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Chart of Accounts"
        description="Double-entry general ledger accounts, bank balances, liabilities, and revenue classifications."
        actions={
          <Link href="/accounts/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              New Account
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="w-full sm:w-80">
          <DebouncedSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search account code or title..."
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Account Type Dropdown */}
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val)}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="ASSET">Asset Accounts</SelectItem>
              <SelectItem value="LIABILITY">Liability Accounts</SelectItem>
              <SelectItem value="CAPITAL">Equity / Capital</SelectItem>
              <SelectItem value="INCOME">Income / Revenue</SelectItem>
              <SelectItem value="EXPENSES">Direct Expenses</SelectItem>
              <SelectItem value="OTHER_EXPENSES">Administrative / Other</SelectItem>
              <SelectItem value="BANK">Bank & Cash Accounts</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40">
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === "ARCHIVED"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <AccountsTable
        accounts={accounts}
        isArchivedTab={statusFilter === "ARCHIVED"}
        onRefresh={loadAccounts}
      />
    </div>
  );
}
