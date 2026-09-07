"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { toast } from "sonner";
import { getJournalsAction } from "@/app/actions/master-data.actions";

interface JournalItem {
  id: string;
  code: string;
  name: string;
  type: "SALES" | "PURCHASE" | "BANK" | "CASH";
  defaultAccount: {
    id: string;
    code: string;
    name: string;
  };
}

export default function JournalsPage() {
  const [journals, setJournals] = React.useState<JournalItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  const loadJournals = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getJournalsAction();
      if (result.success && result.data) {
        setJournals(result.data as JournalItem[]);
      } else {
        toast.error(result.error || "Failed to load journals");
      }
    } catch {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const filtered = React.useMemo(() => {
    return journals.filter((j) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        j.name.toLowerCase().includes(q) ||
        j.code.toLowerCase().includes(q) ||
        j.defaultAccount.name.toLowerCase().includes(q) ||
        j.defaultAccount.code.toLowerCase().includes(q);

      const matchesType = typeFilter === "ALL" || j.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [journals, search, typeFilter]);

  const hasActiveFilters = Boolean(search || typeFilter !== "ALL");

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounting Journals"
        description="Configure accounting posting books for sales, timber purchases, liquid bank flows, and general entries."
        actions={
          <Link href="/journals/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-xs cursor-pointer">
              <Plus className="h-4 w-4" />
              New Journal
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="w-full sm:w-80">
          <DebouncedSearchInput
            placeholder="Search by code, name, or default account..."
            value={search}
            onChange={setSearch}
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Journal Types</option>
            <option value="SALES">Sales</option>
            <option value="PURCHASE">Purchase</option>
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing {filtered.length} of {journals.length} journals
          </span>
          <button
            onClick={handleResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading journals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No journals found matching your filters"
              : "No journals yet. Create your first journal to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Journal Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Default Account</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">{j.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{j.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                        {j.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {j.defaultAccount.code} - {j.defaultAccount.name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
