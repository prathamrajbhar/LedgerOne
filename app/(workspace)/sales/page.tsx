"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getSalesOrdersAction, confirmSalesOrderAction, createInvoiceFromSalesOrderAction } from "@/app/actions/sales.actions";
import { SalesOrderForm } from "./sales-order-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const loadSalesOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSalesOrdersAction({ limit: 50 });
      if (result.success && result.data) {
        setSalesOrders(result.data.data);
      } else {
        toast.error(result.error || "Failed to load sales orders");
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
    } catch (error) {
      console.error("Error confirming sales order:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateInvoice = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await createInvoiceFromSalesOrderAction(id);
      if (result.success) {
        toast.success("Invoice created successfully from sales order");
        loadSalesOrders();
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
          action={
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Sales Order
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Order Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-primary-light/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{so.soNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{so.customer.name}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{formatDate(so.orderDate)}</td>
                  <td className="py-3.5 px-4 text-center text-muted-foreground">{so.lines.length}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{Number(so.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={so.status} />
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
                      {so.status === "CONFIRMED" && (
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
                      {so.status === "INVOICED" && (
                        <span className="text-xs text-muted-foreground">Invoiced</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
