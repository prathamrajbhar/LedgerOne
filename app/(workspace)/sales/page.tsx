"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getSalesOrdersAction,
  confirmSalesOrderAction,
  createInvoiceFromSalesOrderAction,
} from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { SalesOrderForm } from "./sales-order-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useTableSort } from "@/components/ui/sortable-table-head";
import { SalesOrdersFilters } from "./components/sales-orders-filters";
import { SalesOrdersTable, type SalesOrderItem } from "./components/sales-orders-table";
import { useSalesOrdersFilters } from "./components/use-sales-orders-filters";

export default function SalesOrdersPage() {
  const router = useRouter();
  const [salesOrders, setSalesOrders] = React.useState<SalesOrderItem[]>([]);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const {
    search,
    setSearch,
    customerFilter,
    setCustomerFilter,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredOrders,
    hasActiveFilters,
    resetFilters,
  } = useSalesOrdersFilters(salesOrders);

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
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSalesOrders();
  }, [loadSalesOrders]);

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

  const { sortedItems: sortedSalesOrders, sortState, handleSort } = useTableSort<SalesOrderItem, string>(
    filteredOrders,
    "orderDate",
    "desc"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Manage your customer sales orders and fulfillments."
        actions={
          <Link href="/sales/new">
            <Button className="bg-navy hover:bg-navy-hover text-white shadow-xs">
              <Plus className="mr-2 h-4 w-4" /> New Sales Order
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : salesOrders.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title="No Sales Orders"
          description="Create your first sales order to start selling products."
          action={{
            label: "Create Sales Order",
            onClick: () => router.push("/sales/new"),
          }}
        />
      ) : (
        <div className="space-y-4">
          <SalesOrdersFilters
            search={search}
            onSearchChange={setSearch}
            customerFilter={customerFilter}
            onCustomerChange={setCustomerFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            customers={customers}
            hasActiveFilters={hasActiveFilters}
            filteredCount={filteredOrders.length}
            totalCount={salesOrders.length}
            onResetFilters={resetFilters}
          />

          <SalesOrdersTable
            orders={sortedSalesOrders}
            hasActiveFilters={hasActiveFilters}
            sortState={sortState}
            onSort={handleSort}
            actionLoading={actionLoading}
            onConfirmOrder={handleConfirmOrder}
            onCreateInvoice={handleCreateInvoice}
          />
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
