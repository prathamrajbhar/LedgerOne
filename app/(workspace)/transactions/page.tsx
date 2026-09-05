"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";

const transactionsData = [
  { id: "1", date: "18 Nov 2024", code: "INV-2024-1087", party: "Modern Living Interiors", type: "Sales", category: "Commercial Invoicing", amount: 125000, status: "PAID" },
  { id: "2", date: "17 Nov 2024", code: "BILL-2024-056", party: "WoodMart Supplies", type: "Purchase", category: "Raw Timber Lumber", amount: 48500, status: "PENDING" },
  { id: "3", date: "16 Nov 2024", code: "EXP-2024-078", party: "Property Owners Trust", type: "Expense", category: "Showroom Rent - Nov", amount: 25000, status: "PAID" },
  { id: "4", date: "15 Nov 2024", code: "PAY-2024-112", party: "HomeSpace Furniture", type: "Payment", category: "Customer Direct Receipt", amount: 75000, status: "RECEIVED" },
  { id: "5", date: "14 Nov 2024", code: "INV-2024-1086", party: "Urban Deck Architectural", type: "Sales", category: "Bespoke Sofa Set", amount: 96000, status: "PARTIAL" },
  { id: "6", date: "12 Nov 2024", code: "BILL-2024-055", party: "Durian Foam & Hardware", type: "Purchase", category: "Upholstery & Hinges", amount: 31200, status: "PAID" },
  { id: "7", date: "10 Nov 2024", code: "EXP-2024-077", party: "State Electricity Board", type: "Expense", category: "Factory Power Bill", amount: 18400, status: "PAID" },
  { id: "8", date: "08 Nov 2024", code: "INV-2024-1085", party: "Prestige Executive Suites", type: "Sales", category: "Office Workstations", amount: 215000, status: "OVERDUE" },
];

export default function TransactionsPage() {
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");

  const filtered = transactionsData.filter((tx) => {
    const matchesSearch =
      tx.code.toLowerCase().includes(search.toLowerCase()) ||
      tx.party.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || tx.type.toUpperCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Transactions"
        description="Audited ledger entries covering customer invoicing, timber purchase bills, vendor payments, and operational expenses."
        actions={
          <Button
            size="sm"
            onClick={() => toast.success("Exporting full financial transaction ledger...")}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Ledger
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction #, client, or category..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
          {["ALL", "SALES", "PURCHASE", "EXPENSE", "PAYMENT"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filterType === t
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "ALL" ? "All Entries" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Reference #</th>
                <th className="py-3.5 px-4">Entity / Counterparty</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Debit / Credit (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">{row.date}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{row.code}</td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{row.party}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.category}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{row.amount.toLocaleString("en-IN")}.00
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={filtered.length}
        onPageChange={() => {}}
      />
    </div>
  );
}
