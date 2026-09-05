import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";
import { getPurchaseOrdersAction } from "@/app/actions/purchase.actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import { PurchaseOrderRow } from "./purchase-order-row";

export default async function PurchasesPage() {
  const result = await getPurchaseOrdersAction();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Purchase Orders"
          description="Procure raw timber, foam, upholstery fabrics, and track procurement orders."
        />
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">Failed to load purchase orders. Please try again.</p>
        </div>
      </div>
    );
  }

  const purchaseOrders = result.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchase Orders"
        description="Procure raw timber, foam, upholstery fabrics, hardware fittings, and track vendor procurement."
        actions={<PurchaseOrderForm />}
      />

      {purchaseOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-2">No Purchase Orders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first purchase order to start tracking vendor purchases.
          </p>
          <PurchaseOrderForm />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Line Items</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchaseOrders.map((po) => (
                <PurchaseOrderRow
                  key={po.id}
                  po={{
                    ...po,
                    total: Number(po.total),
                    orderDate: po.orderDate instanceof Date ? po.orderDate.toISOString() : String(po.orderDate),
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
