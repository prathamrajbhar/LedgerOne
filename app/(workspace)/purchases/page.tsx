import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { getPurchaseOrdersAction } from "@/app/actions/purchase.actions";
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
        actions={
          <Link href="/purchases/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </Link>
        }
      />

      {serializedPOs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-2">No Purchase Orders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first purchase order to start tracking vendor purchases.
          </p>
          <Link href="/purchases/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Purchase Order
            </Button>
          </Link>
        </div>
      ) : (
        <PurchaseOrdersTable purchaseOrders={serializedPOs} />
      )}
    </div>
  );
}
