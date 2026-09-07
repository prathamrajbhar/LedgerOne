"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { JournalEntryItem } from "../journal-entries-types";

interface JournalEntriesTableProps {
  entries: JournalEntryItem[];
  loading: boolean;
  hasActiveFilters: boolean;
}

export function JournalEntriesTable({
  entries,
  loading,
  hasActiveFilters,
}: JournalEntriesTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">Loading journal entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "No entries found matching your filters"
            : "No journal entries yet. Create your first manual entry to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
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
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-[#F8FAFC] transition-colors">
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
    </div>
  );
}
