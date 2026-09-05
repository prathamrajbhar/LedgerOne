import { salesOrderService } from "@/lib/services/sales-order.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SalesOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let order;
  try {
    order = await salesOrderService.findById(params.id);
  } catch {
    notFound();
  }

  async function confirmOrder() {
    "use server";
    await salesOrderService.confirm(params.id);
    revalidatePath(`/sales/orders/${params.id}`);
    revalidatePath("/sales/orders");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Sales Order: ${order.soNumber}`}
        description={`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/sales/orders">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {order.status === "DRAFT" && (
              <form action={confirmOrder}>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4" /> Confirm Order
                </Button>
              </form>
            )}
            {order.status === "CONFIRMED" && (
              <Link href={`/sales/invoices/new?soId=${order.id}`}>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <FileText className="h-4 w-4" /> Create Customer Invoice
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ordered Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Product</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Qty</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Unit Price</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-medium text-gray-900">{line.product.name}</td>
                      <td className="py-2.5 px-4 text-right text-gray-700">{line.quantity.toString()}</td>
                      <td className="py-2.5 px-4 text-right text-gray-700">${Number(line.unitPrice).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-gray-900">${Number(line.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                  <span>Grand Total:</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-gray-900">{order.customer.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Created By:</span>
                <span className="font-medium text-gray-900">{order.createdBy?.name || "User"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Created At:</span>
                <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
