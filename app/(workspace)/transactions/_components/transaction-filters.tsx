"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [status, setStatus] = React.useState(searchParams.get("status") || "");
  const [source, setSource] = React.useState(searchParams.get("source") || "");
  const isInitialMount = React.useRef(true);

  const applyFilters = React.useCallback((newSearch: string, newStatus: string, newSource: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);
    if (newSource) params.set("source", newSource);
    router.push(`/transactions?${params.toString()}`);
  }, [router]);

  // Debounced auto-filter when search changes
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    applyFilters(search, status, source);
  }, [search, status, source, applyFilters]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSource("");
    router.push("/transactions");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
      <div className="w-full sm:w-80">
        <DebouncedSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by entry #, invoice, bill..."
          className="h-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground outline-none focus:outline-none focus:ring-0 focus:border-border-strong hover:border-border-strong transition-colors"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
        </select>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground outline-none focus:outline-none focus:ring-0 focus:border-border-strong hover:border-border-strong transition-colors"
        >
          <option value="">All Sources</option>
          <option value="MANUAL">Manual</option>
          <option value="VENDOR_BILL">Vendor Bill</option>
          <option value="CUSTOMER_INVOICE">Customer Invoice</option>
          <option value="BILL_PAYMENT">Bill Payment</option>
          <option value="INVOICE_PAYMENT">Invoice Payment</option>
        </select>

        <Button
          onClick={() => applyFilters(search, status, source)}
          size="sm"
          className="bg-navy hover:bg-navy-hover text-white text-xs"
        >
          Filter
        </Button>

        {(search || status || source) && (
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
