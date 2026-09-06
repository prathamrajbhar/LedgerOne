"use client";

import * as React from "react";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { TransactionRow, SerializedJournalEntry } from "./transaction-row";

export interface TransactionTableEntry {
  entry: SerializedJournalEntry;
  docRef: { ref: string; party: string; type: string };
  isBalanced: boolean;
}

interface TransactionsTableProps {
  entries: TransactionTableEntry[];
}

export function TransactionsTable({ entries }: TransactionsTableProps) {
  const { sortedItems, sortState, handleSort } = useTableSort<
    TransactionTableEntry,
    "date" | "entryNumber" | "journal" | "docRef" | "party" | "debit" | "credit" | "status"
  >(
    entries,
    "date",
    "desc",
    {
      date: (row) => new Date(row.entry.accountingDate).getTime(),
      entryNumber: (row) => row.entry.entryNumber,
      journal: (row) => row.entry.journal.name,
      docRef: (row) => row.docRef.ref,
      party: (row) => row.docRef.party,
      debit: (row) => row.entry.totalDebit,
      credit: (row) => row.entry.totalCredit,
      status: (row) => row.entry.status,
    }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <th className="py-3.5 px-4 w-8"></th>
            <SortableTableHead
              columnKey="date"
              currentSort={sortState}
              onSort={handleSort}
              className="py-3.5 px-4"
            >
              Date
            </SortableTableHead>
            <SortableTableHead
              columnKey="entryNumber"
              currentSort={sortState}
              onSort={handleSort}
              className="py-3.5 px-4"
            >
              Entry #
            </SortableTableHead>
            <SortableTableHead
              columnKey="journal"
              currentSort={sortState}
              onSort={handleSort}
              className="py-3.5 px-4"
            >
              Journal
            </SortableTableHead>
            <SortableTableHead
              columnKey="docRef"
              currentSort={sortState}
              onSort={handleSort}
              className="py-3.5 px-4"
            >
              Document Ref
            </SortableTableHead>
            <SortableTableHead
              columnKey="party"
              currentSort={sortState}
              onSort={handleSort}
              className="py-3.5 px-4"
            >
              Party
            </SortableTableHead>
            <SortableTableHead
              columnKey="debit"
              currentSort={sortState}
              onSort={handleSort}
              align="right"
              className="py-3.5 px-4"
            >
              Debit (₹)
            </SortableTableHead>
            <SortableTableHead
              columnKey="credit"
              currentSort={sortState}
              onSort={handleSort}
              align="right"
              className="py-3.5 px-4"
            >
              Credit (₹)
            </SortableTableHead>
            <SortableTableHead
              columnKey="status"
              currentSort={sortState}
              onSort={handleSort}
              align="center"
              className="py-3.5 px-4"
            >
              Status
            </SortableTableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedItems.map(({ entry, docRef, isBalanced }) => (
            <TransactionRow
              key={entry.id}
              entry={entry}
              docRef={docRef}
              isBalanced={isBalanced}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
