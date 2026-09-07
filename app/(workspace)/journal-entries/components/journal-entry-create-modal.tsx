"use client";

import * as React from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";
import { createManualJournalEntryAction } from "@/app/actions/accounting.actions";
import type {
  JournalOption,
  AccountOption,
  ContactOption,
  JournalEntryLine,
} from "../journal-entries-types";

interface JournalEntryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journals: JournalOption[];
  accounts: AccountOption[];
  contacts: ContactOption[];
  onSuccess: () => void;
}

export function JournalEntryCreateModal({
  open,
  onOpenChange,
  journals,
  accounts,
  contacts,
  onSuccess,
}: JournalEntryCreateModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
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
    {
      id: crypto.randomUUID(),
      accountId: "",
      partnerId: "",
      description: "",
      debit: "",
      credit: "",
    },
  ]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
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
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalEntryLine, value: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
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

  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
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

  const accountOptions = React.useMemo(() => {
    return accounts.map((acc) => ({
      value: acc.id,
      label: `${acc.code} - ${acc.name}`,
      subLabel: `Account #${acc.code}`,
    }));
  }, [accounts]);

  const partnerOptions = React.useMemo(() => {
    return [
      { value: "", label: "None" },
      ...contacts.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    ];
  }, [contacts]);

  const journalOptions = React.useMemo(() => {
    return journals.map((j) => ({
      value: j.id,
      label: `${j.code} - ${j.name}`,
    }));
  }, [journals]);

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

    const missingAccount = lines.some((line) => !line.accountId);
    if (missingAccount) {
      toast.error("All lines must have an account selected");
      return;
    }

    const invalidAmount = lines.some((line) => {
      const d = parseFloat(line.debit) || 0;
      const c = parseFloat(line.credit) || 0;
      return d <= 0 && c <= 0;
    });
    if (invalidAmount) {
      toast.error("Every line must have either a Debit or Credit amount greater than 0");
      return;
    }

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
        onOpenChange(false);
        resetForm();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to create journal entry");
      }
    } catch {
      toast.error("Failed to create journal entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-xs cursor-pointer">
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-hidden focus:ring-2 focus:ring-teal/30 focus:border-teal"
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
                className="text-xs cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Line
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
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
                      <td className="py-2 px-3 min-w-[220px]">
                        <SearchableSelect
                          size="sm"
                          value={line.accountId}
                          onChange={(val) => updateLine(line.id, "accountId", val)}
                          options={accountOptions}
                          placeholder="Select account"
                          searchPlaceholder="Search account by code, name..."
                        />
                      </td>
                      <td className="py-2 px-3 min-w-[170px]">
                        <SearchableSelect
                          size="sm"
                          value={line.partnerId}
                          onChange={(val) => updateLine(line.id, "partnerId", val)}
                          options={partnerOptions}
                          placeholder="None"
                          searchPlaceholder="Search partner..."
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, "description", e.target.value)}
                          placeholder="Line description"
                          className="w-full px-2 py-1.5 text-xs rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-teal/30 focus:border-teal"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debit}
                          onChange={(e) => updateLine(line.id, "debit", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-xs text-right rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-teal/30 focus:border-teal"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.credit}
                          onChange={(e) => updateLine(line.id, "credit", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-xs text-right rounded border border-border bg-white focus:outline-hidden focus:ring-1 focus:ring-teal/30 focus:border-teal"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length <= 1}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
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
          </div>

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
                      <span className="text-sm font-semibold text-green-700">Balanced</span>
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
                onOpenChange(false);
                resetForm();
              }}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-navy hover:bg-navy-hover text-white cursor-pointer"
              disabled={submitting || !isBalanced}
            >
              {submitting ? "Creating..." : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
