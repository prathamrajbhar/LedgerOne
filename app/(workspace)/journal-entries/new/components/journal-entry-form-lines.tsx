"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  AccountOption,
  ContactOption,
  JournalEntryLine,
} from "../../journal-entries-types";

interface JournalEntryFormLinesProps {
  lines: JournalEntryLine[];
  accounts: AccountOption[];
  contacts: ContactOption[];
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onUpdateLine: (id: string, field: keyof JournalEntryLine, value: string) => void;
}

export function JournalEntryFormLines({
  lines,
  accounts,
  contacts,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: JournalEntryFormLinesProps) {
  const accountOptions = React.useMemo(() => {
    return accounts.map((acc) => ({
      value: acc.id,
      label: `${acc.code} - ${acc.name}`,
    }));
  }, [accounts]);

  const contactOptions = React.useMemo(() => {
    return [
      { value: "", label: "No Partner / General" },
      ...contacts.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    ];
  }, [contacts]);

  return (
    <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold text-navy uppercase tracking-wider">
          Double-Entry Accounting Rows ({lines.length})
        </span>
        <Button
          type="button"
          onClick={onAddLine}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Entry Line
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-[32%]">Account <span className="text-destructive">*</span></th>
              <th className="py-2.5 px-3 w-[24%]">Partner / Contact</th>
              <th className="py-2.5 px-3 w-[20%]">Label</th>
              <th className="py-2.5 px-3 w-[11%] text-right">Debit (₹)</th>
              <th className="py-2.5 px-3 w-[11%] text-right">Credit (₹)</th>
              <th className="py-2.5 px-2 w-[2%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-[#F8FAFC]/50">
                <td className="p-2 min-w-[200px]">
                  <SearchableSelect
                    size="sm"
                    options={accountOptions}
                    value={line.accountId}
                    onChange={(val) => onUpdateLine(line.id, "accountId", val)}
                    placeholder="Select ledger account..."
                    searchPlaceholder="Search by code or name..."
                    emptyMessage="No accounts found"
                    className="h-8"
                  />
                </td>

                <td className="p-2 min-w-[160px]">
                  <SearchableSelect
                    size="sm"
                    options={contactOptions}
                    value={line.partnerId || ""}
                    onChange={(val) => onUpdateLine(line.id, "partnerId", val)}
                    placeholder="Select partner (optional)..."
                    searchPlaceholder="Search customer/vendor..."
                    emptyMessage="No partner found"
                    className="h-8"
                  />
                </td>

                <td className="p-2">
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => onUpdateLine(line.id, "description", e.target.value)}
                    placeholder="Line description..."
                    className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.debit}
                    onChange={(e) => onUpdateLine(line.id, "debit", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.credit}
                    onChange={(e) => onUpdateLine(line.id, "credit", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </td>

                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveLine(line.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                    title="Delete Line"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
