"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { toast } from "sonner";
import { getJournalEntriesAction } from "@/app/actions/accounting.actions";
import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";
import type { JournalEntryItem } from "./journal-entries-types";
import { JournalEntriesTable } from "./components/journal-entries-table";

export default function JournalEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = React.useState<JournalEntryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<JournalEntryStatus | "">("");
  const [sourceFilter, setSourceFilter] = React.useState<JournalEntrySource | "">("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const loadEntries = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getJournalEntriesAction({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
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
  }, [statusFilter, sourceFilter]);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filtered = React.useMemo(() => {
    return entries.filter((entry) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.entryNumber.toLowerCase().includes(q) ||
        entry.journal.code.toLowerCase().includes(q) ||
        entry.journal.name.toLowerCase().includes(q) ||
        (entry.createdBy?.name && entry.createdBy.name.toLowerCase().includes(q));

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(entry.accountingDate) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(entry.accountingDate) <= new Date(endDate);
      }

      return matchesSearch && matchesDate;
    });
  }, [entries, search, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search || statusFilter || sourceFilter || startDate || endDate
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSourceFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Journal Entries"
        description="Audit, inspect, and post double-entry general ledger journal entries."
        actions={
          <Button
            onClick={() => router.push("/journal-entries/new")}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Journal Entry
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="flex-1 min-w-[220px]">
          <DebouncedSearchInput
            placeholder="Search entry #, journal, or created by..."
            value={search}
            onChange={setSearch}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JournalEntryStatus | "")}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="POSTED">Posted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as JournalEntrySource | "")}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="">All Sources</option>
            <option value="MANUAL">Manual</option>
            <option value="VENDOR_BILL">Vendor Bill</option>
            <option value="CUSTOMER_INVOICE">Customer Invoice</option>
            <option value="BILL_PAYMENT">Bill Payment</option>
            <option value="INVOICE_PAYMENT">Invoice Payment</option>
          </select>

          <div className="col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing {filtered.length} of {entries.length} entries
          </span>
          <button
            onClick={handleResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      <JournalEntriesTable
        entries={filtered}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
