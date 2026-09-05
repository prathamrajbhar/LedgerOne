import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { PurchaseOrdersTable } from "./purchase-orders-table";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; vendor?: string; page?: string };
}) {
  const orders = await purchaseOrderService.list({
    status: searchParams.status as any,
    vendorId: searchParams.vendor,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage vendor purchase orders and procurement pipelines."
        actions={
          <Link href="/purchase/orders/new">
            <Button size="sm" className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </Link>
        }
      />
      <PurchaseOrdersTable data={orders} />
    </div>
  );
}
