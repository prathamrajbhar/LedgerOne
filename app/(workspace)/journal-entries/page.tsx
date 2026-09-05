"use client";

import * as React from "react";
import { Plus, Search, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  getJournalsAction,
  getSelectableAccountsAction,
} from "@/app/actions/master-data.actions";
import {
  getJournalEntriesAction,
  createManualJournalEntryAction,
} from "@/app/actions/accounting.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";

interface JournalEntryItem {
  id: string;
  entryNumber: string;
  accountingDate: Date;
  status: JournalEntryStatus;
  source: JournalEntrySource;
  totalDebit: number;
  totalCredit: number;
  journal: {
    id: string;
    code: string;
    name: string;
  };
  lines: Array<{
    id: string;
    account: {
      code: string;
      name: string;
    };
    partner?: {
      name: string;
    } | null;
    debit: number;
    credit: number;
  }>;
  createdBy: {
    name: string;
  };
}

interface JournalOption {
  id: string;
  code: string;
  name: string;
}

interface AccountOption {
  id: string;
  code: string;
  name: string;
}

interface ContactOption {
  id: string;
  name: string;
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  partnerId: string;
  description: string;
  debit: string;
  credit: string;
}

export default function JournalEntriesPage() {
  const [entries, setEntries] = React.useState<JournalEntryItem[]>([]);
  const [journals, setJournals] = React.useState<JournalOption[]>([]);
  const [accounts, setAccounts] = React.useState<AccountOption[]>([]);
  const [contacts, setContacts] = React.useState<ContactOption[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<JournalEntryStatus | "">("");
  const [sourceFilter, setSourceFilter] = React.useState<JournalEntrySource | "">("");
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Form state
  const [journalId, setJournalId] = React.useState("");
  const [accountingDate, setAccountingDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [reference, setReference] = React.useState("");
  const [lines, setLines] = React.useState<JournalEntryLine[]>([
    {
      id: crypto.randomUUID(),
      accountId: "",
      partnerId: "",
      description: "",
      debit: "",
      credit: "",
    },
  ]);

  // Fetch data on mount
  React.useEffect(() => {
    loadEntries();
    loadJournals();
    loadAccounts();
    loadContacts();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await getJournalEntriesAction({});
      if (result.success && result.data) {
        setEntries(result.data.entries as unknown as JournalEntryItem[]);
      } else {
        toast.error(result.error || "Failed to load journal entries");
      }
    } catch {
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  const loadJournals = async () => {
    try {
      const result = await getJournalsAction();
      if (result.success && result.data) {
        setJournals(result.data as unknown as JournalOption[]);
      }
    } catch {
      // Ignored
    }
  };

  const loadAccounts = async () => {
    try {
      const result = await getSelectableAccountsAction();
      if (result.success && result.data) {
        setAccounts(result.data as unknown as AccountOption[]);
      }
    } catch {
      // Ignored
    }
  };

  const loadContacts = async () => {
    try {
      const result = await getContactsAction({ limit: 1000 });
      if (result.success && result.data) {
        const data = result.data as { contacts: ContactOption[] };
        setContacts(data.contacts || []);
      }
    } catch {
      // Ignored
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        accountId: "",
        partnerId: "",
        description: "",
        debit: "",
        credit: "",
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) {
      toast.error("At least 1 line is required");
      return;
    }
    setLines(lines.filter((line) => line.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalEntryLine, value: string) => {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;
        // Mutual exclusivity: A line is either a Debit or a Credit
        if (field === "debit" && value !== "") {
          return { ...line, debit: value, credit: "" };
        }
        if (field === "credit" && value !== "") {
          return { ...line, credit: value, debit: "" };
        }
        return { ...line, [field]: value };
      })
    );
  };

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => {
    const value = parseFloat(line.debit) || 0;
    return sum + value;
  }, 0);

  const totalCredit = lines.reduce((sum, line) => {
    const value = parseFloat(line.credit) || 0;
    return sum + value;
  }, 0);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0 && totalCredit > 0;

  const resetForm = () => {
    setJournalId("");
    setAccountingDate(new Date().toISOString().split("T")[0]);
    setReference("");
    setLines([
      {
        id: crypto.randomUUID(),
        accountId: "",
        partnerId: "",
        description: "",
        debit: "",
        credit: "",
      },
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!journalId) {
      toast.error("Journal is required");
      return;
    }

    if (!accountingDate) {
      toast.error("Accounting date is required");
      return;
    }

    if (lines.length < 2) {
      toast.error("A balanced double-entry transaction requires at least 2 lines (Debit and Credit). Please click '+ Add Line'.");
      return;
    }

    // Validate all lines have account selected
    const missingAccount = lines.some((line) => !line.accountId);
    if (missingAccount) {
      toast.error("All lines must have an account selected");
      return;
    }

    // Validate each line has either debit or credit > 0
    const invalidAmount = lines.some((line) => {
      const d = parseFloat(line.debit) || 0;
      const c = parseFloat(line.credit) || 0;
      return d <= 0 && c <= 0;
    });
    if (invalidAmount) {
      toast.error("Every line must have either a Debit or Credit amount greater than 0");
      return;
    }

    // Check if balanced
    if (!isBalanced) {
      toast.error(`Entry is unbalanced. Total Debit ($${totalDebit.toFixed(2)}) must equal Total Credit ($${totalCredit.toFixed(2)}).`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createManualJournalEntryAction({
        journalId,
        accountingDate: new Date(accountingDate),
        lines: lines.map((line) => ({
          accountId: line.accountId,
          partnerId: line.partnerId || undefined,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
        })),
      });

      if (result.success && result.data) {
        toast.success(`Journal Entry ${result.data.entryNumber} created successfully.`);
        setOpenModal(false);
        resetForm();
        loadEntries();
      } else {
        toast.error(result.error || "Failed to create journal entry");
      }
    } catch (error) {
      toast.error("Failed to create journal entry");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter entries
  const filtered = entries.filter((entry) => {
    const matchesSearch =
      search === "" ||
      entry.entryNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || entry.status === statusFilter;
    const matchesSource = sourceFilter === "" || entry.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const journalOptions = journals.map((j) => ({
    value: j.id,
    label: `${j.code} - ${j.name}`,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Journal Entries"
        description="Manual and auto-generated accounting entries with balance enforcement."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Create Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Manual Journal Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Journal"
                    required
                    value={journalId}
                    onValueChange={setJournalId}
                    options={journalOptions}
                    placeholder="Select a journal"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Accounting Date <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={accountingDate}
                      onChange={(e) => setAccountingDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    />
                  </div>
                </div>

                <FormInput
                  label="Reference (Optional)"
                  placeholder="e.g. Year-end adjustment"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-foreground">
                      Journal Entry Lines <span className="text-destructive">*</span>
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addLine}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Line
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-border">
                          <th className="py-2 px-3 text-left font-semibold text-[11px] uppercase tracking-wide">
                            Account
                          </th>
                          <th className="py-2 px-3 text-left font-semibold text-[11px] uppercase tracking-wide">
                            Partner
                          </th>
                          <th className="py-2 px-3 text-left font-semibold text-[11px] uppercase tracking-wide">
                            Description
                          </th>
                          <th className="py-2 px-3 text-right font-semibold text-[11px] uppercase tracking-wide">
                            Debit
                          </th>
                          <th className="py-2 px-3 text-right font-semibold text-[11px] uppercase tracking-wide">
                            Credit
                          </th>
                          <th className="py-2 px-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {lines.map((line) => (
                          <tr key={line.id} className="bg-white">
                            <td className="py-2 px-3">
                              <select
                                value={line.accountId}
                                onChange={(e) =>
                                  updateLine(line.id, "accountId", e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal"
                                required
                              >
                                <option value="">Select account</option>
                                {accounts.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.code} - {acc.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={line.partnerId}
                                onChange={(e) =>
                                  updateLine(line.id, "partnerId", e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal"
                              >
                                <option value="">None</option>
                                {contacts.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) =>
                                  updateLine(line.id, "description", e.target.value)
                                }
                                placeholder="Line description"
                                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.debit}
                                onChange={(e) =>
                                  updateLine(line.id, "debit", e.target.value)
                                }
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 text-xs text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.credit}
                                onChange={(e) =>
                                  updateLine(line.id, "credit", e.target.value)
                                }
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 text-xs text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLine(line.id)}
                                disabled={lines.length <= 1}
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="rounded-lg border-2 border-border bg-[#F9FAFB] p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Total Debit
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${totalDebit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Total Credit
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${totalCredit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Balance Status
                      </div>
                      <div className="flex items-center gap-2">
                        {isBalanced ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              Balanced
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <span className="text-sm font-semibold text-destructive">
                              Unbalanced (Diff: ${difference.toFixed(2)})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOpenModal(false);
                      resetForm();
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting || !isBalanced}
                  >
                    {submitting ? "Creating..." : "Create Entry"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by entry number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JournalEntryStatus | "")}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as JournalEntrySource | "")}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        >
          <option value="">All Sources</option>
          <option value="MANUAL">Manual</option>
          <option value="VENDOR_BILL">Vendor Bill</option>
          <option value="CUSTOMER_INVOICE">Customer Invoice</option>
          <option value="BILL_PAYMENT">Bill Payment</option>
          <option value="INVOICE_PAYMENT">Invoice Payment</option>
        </select>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading journal entries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {search || statusFilter || sourceFilter
              ? "No entries found matching your filters"
              : "No journal entries yet. Create your first manual entry to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Entry Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Journal</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Total Debit</th>
                <th className="py-3.5 px-4 text-right">Total Credit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {entry.entryNumber}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {new Date(entry.accountingDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {entry.journal.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                      {entry.source}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                    ${Number(entry.totalDebit).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                    ${Number(entry.totalCredit).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge
                      variant={entry.status === "POSTED" ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {entry.createdBy.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
