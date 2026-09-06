import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";
import { getPurchaseOrdersAction } from "@/app/actions/purchase.actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import { PurchaseOrdersTable } from "./purchase-orders-table";

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

  const serializedPOs = result.data.map((po) => ({
    ...po,
    total: Number(po.total),
    orderDate: po.orderDate instanceof Date ? po.orderDate.toISOString() : String(po.orderDate),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchase Orders"
        description="Procure raw timber, foam, upholstery fabrics, hardware fittings, and track vendor procurement."
        actions={<PurchaseOrderForm />}
      />

      {serializedPOs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-2">No Purchase Orders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first purchase order to start tracking vendor purchases.
          </p>
          <PurchaseOrderForm />
        </div>
      ) : (
        <PurchaseOrdersTable purchaseOrders={serializedPOs} />
      )}
    </div>
  );
}
