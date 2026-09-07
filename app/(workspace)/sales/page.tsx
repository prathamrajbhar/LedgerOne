"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, FileText, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { getSalesOrdersAction, confirmSalesOrderAction, createInvoiceFromSalesOrderAction } from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { SalesOrderForm } from "./sales-order-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

interface SalesOrderItem {
  id: string;
  soNumber: string;
  customerId?: string;
  customer?: { id?: string; name: string } | null;
  orderDate: string | Date;
  status: string;
  total: unknown;
  lines?: unknown[];
  invoices?: Array<{ id: string; invoiceNumber: string; status: string }>;
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salesOrders, setSalesOrders] = React.useState<SalesOrderItem[]>([]);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [customerFilter, setCustomerFilter] = React.useState(searchParams.get("customer") || "ALL");
  const [statusFilter, setStatusFilter] = React.useState(
    searchParams.get("status")?.toUpperCase() || "ALL"
  );
  const [startDate, setStartDate] = React.useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = React.useState(searchParams.get("endDate") || "");
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const loadSalesOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, contactsRes] = await Promise.all([
        getSalesOrdersAction({ limit: 100 }),
        getContactsAction({ type: "CUSTOMER", limit: 100 }),
      ]);

      if (ordersRes.success && ordersRes.data) {
        const orderData = ordersRes.data as { data?: SalesOrderItem[] };
        setSalesOrders(orderData.data || []);
      } else {
        toast.error(ordersRes.error || "Failed to load sales orders");
      }

      if (contactsRes.success && contactsRes.data) {
        const cData = contactsRes.data as { contacts?: Array<{ id: string; name: string }> };
        setCustomers(cData.contacts || []);
      }
    } catch (error) {
      console.error("Error loading sales orders:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSalesOrders();
  }, [loadSalesOrders]);

  const filteredOrders = React.useMemo(() => {
    return salesOrders.filter((so) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        so.soNumber.toLowerCase().includes(q) ||
        (so.customer?.name && so.customer.name.toLowerCase().includes(q));

      const matchesCustomer =
        customerFilter === "ALL" ||
        so.customerId === customerFilter ||
        so.customer?.id === customerFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        so.status.toUpperCase() === statusFilter.toUpperCase();

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(so.orderDate) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(so.orderDate) <= new Date(endDate);
      }

      return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
    });
  }, [salesOrders, search, customerFilter, statusFilter, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search || customerFilter !== "ALL" || statusFilter !== "ALL" || startDate || endDate
  );

  const handleResetFilters = () => {
    setSearch("");
    setCustomerFilter("ALL");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const handleConfirmOrder = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await confirmSalesOrderAction(id);
      if (result.success) {
        toast.success("Sales order confirmed successfully");
        loadSalesOrders();
      } else {
        toast.error(result.error || "Failed to confirm sales order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateInvoice = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await createInvoiceFromSalesOrderAction(id);
      if (result.success && result.data) {
        toast.success("Invoice created successfully");
        router.push(`/invoices/${(result.data as { id: string }).id}`);
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateValue: string | Date) => {
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const { sortedItems: sortedSalesOrders, sortState, handleSort } = useTableSort<
    SalesOrderItem,
    "soNumber" | "customer" | "orderDate" | "items" | "total" | "status"
  >(
    filteredOrders,
    "orderDate",
    "desc",
    {
      customer: (item) => item.customer?.name || "",
      orderDate: (item) => new Date(item.orderDate).getTime(),
      items: (item) => item.lines?.length || 0,
      total: (item) => Number(item.total || 0),
      status: (item) => item.status,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Orders"
        description="Furniture sales orders, quotations, confirmed order bookings, and fulfillment status."
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Sales Order
          </Button>
        }
      />

      {salesOrders.length === 0 ? (
        <EmptyState
          title="No sales orders yet"
          description="Create your first sales order to get started"
          action={{
            label: "Create Sales Order",
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {/* Filter Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
            <div className="flex-1 min-w-[220px]">
              <DebouncedSearchInput
                placeholder="Search sales orders by order # or customer..."
                value={search}
                onChange={setSearch}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
              >
                <option value="ALL">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
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
                Showing {filteredOrders.length} of {salesOrders.length} sales orders
              </span>
              <button
                onClick={handleResetFilters}
                className="text-teal hover:underline font-medium cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
            {sortedSalesOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {hasActiveFilters
                  ? "No sales orders found matching your filters"
                  : "No sales orders recorded yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead>
                  <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                    <SortableTableHead
                      columnKey="soNumber"
                      currentSort={sortState}
                      onSort={handleSort}
                      className="py-3.5 px-4"
                    >
                      Order #
                    </SortableTableHead>
                    <SortableTableHead
                      columnKey="customer"
                      currentSort={sortState}
                      onSort={handleSort}
                      className="py-3.5 px-4"
                    >
                      Customer
                    </SortableTableHead>
                    <SortableTableHead
                      columnKey="orderDate"
                      currentSort={sortState}
                      onSort={handleSort}
                      className="py-3.5 px-4"
                    >
                      Order Date
                    </SortableTableHead>
                    <SortableTableHead
                      columnKey="items"
                      currentSort={sortState}
                      onSort={handleSort}
                      align="center"
                      className="py-3.5 px-4"
                    >
                      Items
                    </SortableTableHead>
                    <SortableTableHead
                      columnKey="total"
                      currentSort={sortState}
                      onSort={handleSort}
                      align="right"
                      className="py-3.5 px-4"
                    >
                      Order Total
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
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedSalesOrders.map((so) => {
                    const isInvoiced = so.status === "INVOICED" || (so.invoices && so.invoices.length > 0);
                    return (
                      <tr key={so.id} className="hover:bg-primary-light/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy">{so.soNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">{so.customer?.name || "N/A"}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{formatDate(so.orderDate)}</td>
                        <td className="py-3.5 px-4 text-center text-muted-foreground">{so.lines?.length || 0}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-foreground">
                          ₹{Number(so.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={isInvoiced ? "INVOICED" : so.status} />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {so.status === "DRAFT" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmOrder(so.id)}
                                disabled={actionLoading === so.id}
                                className="gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                {actionLoading === so.id ? "Confirming..." : "Confirm"}
                              </Button>
                            )}
                            {so.status === "CONFIRMED" && !isInvoiced && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCreateInvoice(so.id)}
                                disabled={actionLoading === so.id}
                                className="gap-1.5 text-navy border-navy hover:bg-navy hover:text-white"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {actionLoading === so.id ? "Creating..." : "Create Invoice"}
                              </Button>
                            )}
                            {isInvoiced && (
                              <Link
                                href={so.invoices?.[0]?.id ? `/invoices/${so.invoices[0].id}` : `/invoices?search=${encodeURIComponent(so.soNumber)}`}
                                className="inline-flex items-center gap-1 text-xs text-navy font-medium hover:underline"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Invoice
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      )}

      <SalesOrderForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadSalesOrders}
      />
    </div>
  );
}

