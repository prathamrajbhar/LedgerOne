"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ContactsTable, ContactItem } from "./contacts-table";
import { ContactsKanban } from "./contacts-kanban";
import { Pagination } from "@/components/ui/pagination";

const initialContacts: ContactItem[] = [
  {
    id: "cont-1",
    name: "Modern Living Interiors",
    type: "CUSTOMER",
    email: "procurement@modernliving.in",
    phone: "+91 98201 44556",
    address: "Bandra Kurla Complex, Mumbai, MH",
    outstandingBalance: 125000,
  },
  {
    id: "cont-2",
    name: "WoodMart Timber Supplies",
    type: "VENDOR",
    email: "accounts@woodmartsupplies.com",
    phone: "+91 98450 11223",
    address: "Industrial Area Phase 2, Bangalore, KA",
    outstandingBalance: 48500,
  },
  {
    id: "cont-3",
    name: "HomeSpace Furniture Studio",
    type: "CUSTOMER",
    email: "billing@homespace.co",
    phone: "+91 91234 56789",
    address: "Sector 18, Noida, UP",
    outstandingBalance: 75000,
  },
  {
    id: "cont-4",
    name: "Durian Foam & Hardware Co",
    type: "VENDOR",
    email: "orders@durianhardware.in",
    phone: "+91 99887 76655",
    address: "Peenya Industrial Area, Bangalore, KA",
    outstandingBalance: 62000,
  },
  {
    id: "cont-5",
    name: "Urban Deck Architectural Works",
    type: "BOTH",
    email: "contact@urbandeck.design",
    phone: "+91 94432 10987",
    address: "Koramangala 4th Block, Bangalore, KA",
    outstandingBalance: 34000,
  },
];

export default function ContactsPage() {
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);

  const filteredContacts = initialContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    const matchesType =
      typeFilter === "ALL" ||
      c.type === typeFilter ||
      (c.type === "BOTH" && (typeFilter === "CUSTOMER" || typeFilter === "VENDOR"));
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        description="Manage customers, furniture vendors, and contractor accounts."
        actions={
          <Link href="/contacts/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Contact
            </Button>
          </Link>
        }
      />

      {/* Filter and View Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Type Filter Buttons + List/Kanban Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
            {["ALL", "CUSTOMER", "VENDOR"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  typeFilter === type
                    ? "bg-white text-navy font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "ALL" ? "All" : type === "CUSTOMER" ? "Customers" : "Suppliers"}
              </button>
            ))}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === "list" ? (
        <ContactsTable contacts={filteredContacts} />
      ) : (
        <ContactsKanban contacts={filteredContacts} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={1}
        totalItems={filteredContacts.length}
        onPageChange={setPage}
      />
    </div>
  );
}
