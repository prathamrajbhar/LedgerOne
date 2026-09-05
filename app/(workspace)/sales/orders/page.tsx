import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { salesOrderService } from "@/lib/services/sales-order.service";
import { SalesOrdersTable } from "./sales-orders-table";

export const dynamic = "force-dynamic";

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; customer?: string; page?: string };
}) {
  const orders = await salesOrderService.list({
    status: searchParams.status as any,
    customerId: searchParams.customer,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Track customer orders, confirm fulfillment, and generate invoices."
        actions={
          <Link href="/sales/orders/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Sales Order
            </Button>
          </Link>
        }
      />
      <SalesOrdersTable data={orders} />
    </div>
  );
}
