"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createManualJournalEntryAction } from "@/app/actions/accounting.actions";
import type {
  JournalOption,
  AccountOption,
  ContactOption,
  JournalEntryLine,
} from "../journal-entries-types";
import { JournalEntryFormHeader } from "./components/journal-entry-form-header";
import { JournalEntryFormMeta } from "./components/journal-entry-form-meta";
import { JournalEntryFormLines } from "./components/journal-entry-form-lines";
import { JournalEntryFormBalance } from "./components/journal-entry-form-balance";

interface JournalEntryCreateClientProps {
  journals: JournalOption[];
  accounts: AccountOption[];
  contacts: ContactOption[];
}

export function JournalEntryCreateClient({
  journals,
  accounts,
  contacts,
}: JournalEntryCreateClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [journalId, setJournalId] = React.useState(journals[0]?.id || "");
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
    if (lines.length <= 2) {
      toast.error("At least 2 lines are required for double-entry balancing");
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

  const totalDebit = React.useMemo(() => {
    return lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  }, [lines]);

  const totalCredit = React.useMemo(() => {
    return lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  }, [lines]);

  const isBalanced =
    lines.length >= 2 &&
    totalDebit > 0 &&
    Math.abs(totalDebit - totalCredit) < 0.001;

  const handlePost = async () => {
    if (!journalId) {
      toast.error("Please select a journal");
      return;
    }
    if (!accountingDate) {
      toast.error("Accounting date is required");
      return;
    }
    if (!reference.trim()) {
      toast.error("Reference / Memo is required");
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
      toast.error("Every line must have either Debit or Credit greater than 0");
      return;
    }
    if (!isBalanced) {
      toast.error(`Entry is unbalanced. Debit (₹${totalDebit}) must equal Credit (₹${totalCredit})`);
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
        toast.success(`Journal Entry ${result.data.entryNumber} posted successfully!`);
        router.push("/journal-entries");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create journal entry");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <JournalEntryFormHeader
        submitting={submitting}
        isBalanced={isBalanced}
        onSave={handlePost}
        onCancel={() => router.push("/journal-entries")}
      />

      <JournalEntryFormMeta
        journalId={journalId}
        onJournalIdChange={setJournalId}
        journals={journals}
        accountingDate={accountingDate}
        onAccountingDateChange={setAccountingDate}
        reference={reference}
        onReferenceChange={setReference}
      />

      <JournalEntryFormLines
        lines={lines}
        accounts={accounts}
        contacts={contacts}
        onAddLine={addLine}
        onRemoveLine={removeLine}
        onUpdateLine={updateLine}
      />

      <JournalEntryFormBalance
        totalDebit={totalDebit}
        totalCredit={totalCredit}
        isBalanced={isBalanced}
      />
    </div>
  );
}
