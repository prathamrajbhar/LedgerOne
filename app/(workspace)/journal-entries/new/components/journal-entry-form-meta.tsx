"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import type { JournalOption } from "../../journal-entries-types";

interface JournalEntryFormMetaProps {
  journalId: string;
  onJournalIdChange: (val: string) => void;
  journals: JournalOption[];
  accountingDate: string;
  onAccountingDateChange: (val: string) => void;
  reference: string;
  onReferenceChange: (val: string) => void;
}

export function JournalEntryFormMeta({
  journalId,
  onJournalIdChange,
  journals,
  accountingDate,
  onAccountingDateChange,
  reference,
  onReferenceChange,
}: JournalEntryFormMetaProps) {
  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
        Journal Entry Header Particulars
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Journal Selection */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Journal Book <span className="text-destructive">*</span>
          </label>
          <select
            value={journalId}
            onChange={(e) => onJournalIdChange(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="">Select a Journal...</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.code} - {j.name}
              </option>
            ))}
          </select>
        </div>

        {/* Accounting Date */}
        <FormInput
          label="Accounting Date"
          type="date"
          required
          value={accountingDate}
          onChange={(e) => onAccountingDateChange(e.target.value)}
        />

        {/* Reference / Note */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Reference / Memo <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder="e.g., Monthly Depreciation or Bank Adjustment"
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>
    </Card>
  );
}
