"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [status, setStatus] = React.useState(searchParams.get("status") || "");
  const [source, setSource] = React.useState(searchParams.get("source") || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    router.push(`/transactions?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSource("");
    router.push("/transactions");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          placeholder="Search by entry #, invoice, bill..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
        </select>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Sources</option>
          <option value="MANUAL">Manual</option>
          <option value="VENDOR_BILL">Vendor Bill</option>
          <option value="CUSTOMER_INVOICE">Customer Invoice</option>
          <option value="BILL_PAYMENT">Bill Payment</option>
          <option value="INVOICE_PAYMENT">Invoice Payment</option>
        </select>

        <Button
          onClick={handleFilter}
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
