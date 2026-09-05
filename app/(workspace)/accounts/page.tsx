"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AccountsTable, AccountItem } from "./accounts-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  getChartOfAccountsAction,
  createAccountAction
} from "@/app/actions/master-data.actions";
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
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // New account form state
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState<AccountType>("ASSET");

  const loadAccounts = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getChartOfAccountsAction({
        includeArchived: statusFilter === "ARCHIVED",
      });
      if (result.success && result.data) {
        setAccounts(result.data as AccountItem[]);
      } else {
        toast.error(result.error || "Failed to load accounts");
      }
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch accounts on mount or status change
  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode || !newName) {
      toast.error("Code and Name are required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAccountAction({
        code: newCode,
        name: newName,
        type: newType,
      });

      if (result.success) {
        toast.success(`Account ${newCode} - ${newName} added to ledger`);
        setOpenModal(false);
        setNewCode("");
        setNewName("");
        setNewType("ASSET");
        loadAccounts(); // Reload accounts
      } else {
        toast.error(result.error || "Failed to create account");
      }
    } catch (error) {
      toast.error("Failed to create account");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Chart of Accounts"
        description="Double-entry general ledger accounts, bank balances, liabilities, and revenue classifications."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add General Ledger Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-4 pt-2">
                <FormInput
                  label="Account Code"
                  required
                  placeholder="e.g. 1030"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <FormInput
                  label="Account Name"
                  required
                  placeholder="e.g. Axis Bank Current A/c"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <FormSelect
                  label="Classification Type"
                  value={newType}
                  onValueChange={(val) => setNewType(val as AccountType)}
                  options={[
                    { value: "BANK", label: "Bank Account (Liquid Asset)" },
                    { value: "CASH", label: "Cash Account" },
                    { value: "ASSET", label: "Current Asset / Inventory" },
                    { value: "LIABILITY", label: "Liability / Trade Payable" },
                    { value: "CAPITAL", label: "Equity / Capital" },
                    { value: "INCOME", label: "Income / Sales Revenue" },
                    { value: "EXPENSES", label: "Direct Expense (COGS)" },
                    { value: "OTHER_EXPENSES", label: "Administrative / Other Expense" },
                  ]}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account code or title..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Account Type Dropdown */}
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val)}
          >
            <SelectTrigger className="h-9 w-[135px] text-xs bg-white border-border text-foreground font-medium">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="BANK">Bank</SelectItem>
              <SelectItem value="ASSET">Asset</SelectItem>
              <SelectItem value="LIABILITY">Liability</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSES">Expenses</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border shrink-0">
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                statusFilter === "ARCHIVED"
                  ? "bg-white text-amber-700 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading accounts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {search || typeFilter !== "ALL"
              ? "No accounts found matching your filters"
              : "No accounts yet. Create your first account to get started."}
          </p>
        </div>
      ) : (
        <AccountsTable
          accounts={filtered}
          onRefresh={loadAccounts}
          isArchivedTab={statusFilter === "ARCHIVED"}
        />
      )}
    </div>
  );
}
