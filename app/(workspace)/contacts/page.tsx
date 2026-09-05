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
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type")?.toUpperCase() || "ALL";

  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>(
    initialType === "CUSTOMER" || initialType === "VENDOR" ? initialType : "ALL"
  );
  const [statusFilter, setStatusFilter] = React.useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const paramType = searchParams.get("type")?.toUpperCase();
    if (paramType === "CUSTOMER" || paramType === "VENDOR") {
      setTypeFilter(paramType);
    } else if (!paramType) {
      setTypeFilter("ALL");
    }
  }, [searchParams]);

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
      isArchived: statusFilter === "ARCHIVED",
      page,
      limit: 25,
    });

    if (result.success && result.data) {
      // Map backend data to ContactItem format
      const contactList = result.data as {
        contacts: Array<{
          id: string;
          name: string;
          type: ContactType;
          email: string;
          phone?: string | null;
          address?: string | null;
          isArchived?: boolean;
          outstandingBalance?: number;
        }>;
        totalPages: number;
        total: number;
      };
      const mappedContacts: ContactItem[] = (contactList.contacts || []).map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        email: c.email,
        phone: c.phone || undefined,
        address: c.address || undefined,
        isArchived: c.isArchived,
        outstandingBalance: typeof c.outstandingBalance === "number" ? c.outstandingBalance : 0,
      }));

      setContacts(mappedContacts);
      setTotalPages(contactList.totalPages);
      setTotalItems(contactList.total);
    } else {
      setError(result.error || "Failed to load contacts");
      toast.error(result.error || "Failed to load contacts");
    }

    setLoading(false);
  }, [search, typeFilter, statusFilter, page]);

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

  // Dynamic titles and labels based on active filter
  const pageMeta = React.useMemo(() => {
    if (typeFilter === "CUSTOMER") {
      return {
        title: "Customers",
        description: "Manage retail & wholesale client accounts, billing information, and portal access.",
        buttonText: "New Customer",
        createUrl: "/contacts/new?type=CUSTOMER",
        searchPlaceholder: "Search customers by name, email, or phone...",
      };
    }
    if (typeFilter === "VENDOR") {
      return {
        title: "Vendors & Suppliers",
        description: "Manage raw material suppliers, timber sawmills, logistics providers, and payment terms.",
        buttonText: "New Vendor",
        createUrl: "/contacts/new?type=VENDOR",
        searchPlaceholder: "Search vendors by company, email, or phone...",
      };
    }
    return {
      title: "Contacts Directory",
      description: "Manage customers, furniture vendors, and contractor accounts in one unified directory.",
      buttonText: "New Contact",
      createUrl: "/contacts/new",
      searchPlaceholder: "Search contacts by name, email, or phone...",
    };
  }, [typeFilter]);

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    setPage(1);
    if (val === "ALL") {
      router.replace("/contacts");
    } else {
      router.replace(`/contacts?type=${val}`);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={pageMeta.title}
        description={pageMeta.description}
        actions={
          <Link href={pageMeta.createUrl}>
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              {pageMeta.buttonText}
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
            placeholder={pageMeta.searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
            disabled={loading}
          />
        </div>

        {/* Type Filter Buttons + List/Kanban Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Type Filter Dropdown */}
          <Select
            value={typeFilter}
            onValueChange={handleTypeChange}
            disabled={loading}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs bg-white border-border text-foreground font-medium">
              <SelectValue placeholder="All Contacts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Contacts</SelectItem>
              <SelectItem value="CUSTOMER">Customers</SelectItem>
              <SelectItem value="VENDOR">Suppliers</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter (Active vs Archived) */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
            <button
              onClick={() => {
                setStatusFilter("ACTIVE");
                setPage(1);
              }}
              disabled={loading}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setStatusFilter("ARCHIVED");
                setPage(1);
              }}
              disabled={loading}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === "ARCHIVED"
                  ? "bg-white text-amber-700 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived
            </button>
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
            <ContactsTable
              contacts={contacts}
              onRefresh={fetchContacts}
              isArchivedTab={statusFilter === "ARCHIVED"}
            />
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
