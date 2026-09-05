"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ContactsTable, ContactItem } from "./contacts-table";
import { ContactsKanban } from "./contacts-kanban";
import { Pagination } from "@/components/ui/pagination";
import { getContactsAction } from "@/app/actions/contact.actions";
import { ContactType } from "@prisma/client";
import { toast } from "sonner";

export default function ContactsPage() {
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);

  const [contacts, setContacts] = React.useState<ContactItem[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch contacts from backend
  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getContactsAction({
      search: search || undefined,
      type: typeFilter !== "ALL" ? (typeFilter as ContactType) : undefined,
      page,
      limit: 25,
    });

    if (result.success && result.data) {
      // Map backend data to ContactItem format
      const mappedContacts: ContactItem[] = result.data.contacts.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        email: c.email,
        phone: c.phone || undefined,
        address: c.address || undefined,
        outstandingBalance: 0, // TODO: Calculate from transactions when implemented
      }));

      setContacts(mappedContacts);
      setTotalPages(result.data.totalPages);
      setTotalItems(result.data.total);
    } else {
      setError(result.error || "Failed to load contacts");
      toast.error(result.error || "Failed to load contacts");
    }

    setLoading(false);
  }, [search, typeFilter, page]);

  // Fetch on mount and when filters change
  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Debounce search input
  const [searchInput, setSearchInput] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
            disabled={loading}
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
                disabled={loading}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  typeFilter === type
                    ? "bg-white text-navy font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Loading contacts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Failed to Load Contacts</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <Button onClick={fetchContacts} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && contacts.length === 0 && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Contacts Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {search || typeFilter !== "ALL"
                ? "Try adjusting your search or filters."
                : "Get started by creating your first contact."}
            </p>
            {!search && typeFilter === "ALL" && (
              <Link href="/contacts/new">
                <Button className="mt-4 bg-navy hover:bg-navy-hover text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Contact
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* View Rendering */}
      {!loading && !error && contacts.length > 0 && (
        <>
          {viewMode === "list" ? (
            <ContactsTable contacts={contacts} />
          ) : (
            <ContactsKanban contacts={contacts} />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
