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

const initialAccounts: AccountItem[] = [
  { id: "acc-1", code: "1010", name: "HDFC Bank Current A/c", type: "BANK", balance: 1485000, isArchived: false },
  { id: "acc-2", code: "1020", name: "Cash in Hand (Showroom Petty Cash)", type: "CASH", balance: 375000, isArchived: false },
  { id: "acc-3", code: "1200", name: "Accounts Receivable (Trade Debtors)", type: "ASSET", balance: 325000, isArchived: false },
  { id: "acc-4", code: "1300", name: "Finished Furniture Inventory", type: "ASSET", balance: 1840000, isArchived: false },
  { id: "acc-5", code: "2100", name: "Accounts Payable (Timber & Hardware Suppliers)", type: "LIABILITY", balance: 187500, isArchived: false },
  { id: "acc-6", code: "2200", name: "Output GST Payable (18%)", type: "LIABILITY", balance: 64200, isArchived: false },
  { id: "acc-7", code: "3000", name: "Owner's Equity Capital", type: "CAPITAL", balance: 2500000, isArchived: false },
  { id: "acc-8", code: "4000", name: "Furniture Sales Revenue", type: "INCOME", balance: 1245000, isArchived: false },
  { id: "acc-9", code: "5010", name: "Raw Material Wood & Timber Purchases", type: "EXPENSES", balance: 480000, isArchived: false },
  { id: "acc-10", code: "5020", name: "Carpentry & Workshop Labor Salaries", type: "EXPENSES", balance: 215000, isArchived: false },
  { id: "acc-11", code: "5030", name: "Showroom Rent & Electricity", type: "EXPENSES", balance: 137500, isArchived: false },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [openModal, setOpenModal] = React.useState(false);

  // New account form state
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState<AccountItem["type"]>("ASSET");
  const [newBalance, setNewBalance] = React.useState("0");

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      toast.error("Code and Name are required");
      return;
    }

    const created: AccountItem = {
      id: `acc-${Date.now()}`,
      code: newCode,
      name: newName,
      type: newType,
      balance: Number(newBalance) || 0,
      isArchived: false,
    };

    setAccounts([created, ...accounts]);
    toast.success(`Account ${newCode} - ${newName} added to ledger`);
    setOpenModal(false);
    setNewCode("");
    setNewName("");
    setNewBalance("0");
  };

  const filtered = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.code.includes(search);
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
                  onValueChange={(val) => setNewType(val as AccountItem["type"])}
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
                <FormInput
                  label="Opening Balance (₹)"
                  type="number"
                  placeholder="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Create Account
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
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#F6F7F9] border border-border overflow-x-auto w-full sm:w-auto">
          {["ALL", "BANK", "ASSET", "LIABILITY", "INCOME", "EXPENSES"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                typeFilter === t
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <AccountsTable accounts={filtered} />
    </div>
  );
}
