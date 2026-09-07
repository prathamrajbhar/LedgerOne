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
      if (!search) return true;
      return entry.entryNumber.toLowerCase().includes(search.toLowerCase());
    });
  }, [entries, search]);

  const hasActiveFilters = Boolean(search || statusFilter || sourceFilter);

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

      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-xs w-full">
          <DebouncedSearchInput
            placeholder="Search by entry #..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JournalEntryStatus | "")}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-hidden focus:ring-2 focus:ring-teal/30 focus:border-teal cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as JournalEntrySource | "")}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-hidden focus:ring-2 focus:ring-teal/30 focus:border-teal cursor-pointer"
        >
          <option value="">All Sources</option>
          <option value="MANUAL">Manual</option>
          <option value="VENDOR_BILL">Vendor Bill</option>
          <option value="CUSTOMER_INVOICE">Customer Invoice</option>
          <option value="BILL_PAYMENT">Bill Payment</option>
          <option value="INVOICE_PAYMENT">Invoice Payment</option>
        </select>
      </div>

      <JournalEntriesTable
        entries={filtered}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
