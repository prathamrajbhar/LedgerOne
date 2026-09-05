import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RecordBillPaymentDialog } from "./record-payment-dialog";

export const dynamic = "force-dynamic";

export default async function VendorBillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let bill;
  try {
    bill = await vendorBillService.findById(params.id);
  } catch {
    notFound();
  }

  async function confirmBill() {
    "use server";
    await vendorBillService.confirm(params.id);
    revalidatePath(`/purchase/bills/${params.id}`);
    revalidatePath("/purchase/bills");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Vendor Bill: ${bill.billNumber}`}
        description={`Bill Date: ${new Date(bill.billDate).toLocaleDateString()} · Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/purchase/bills">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {bill.status === "DRAFT" && (
              <form action={confirmBill}>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4" /> Confirm Bill
                </Button>
              </form>
            )}
            {bill.status === "CONFIRMED" && Number(bill.amountDue) > 0 && (
              <RecordBillPaymentDialog
                billId={bill.id}
                amountDue={Number(bill.amountDue)}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Billed Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Product</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Qty</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Unit Cost</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bill.lines.map((line) => (
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
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-gray-900">${Number(bill.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="text-emerald-600 font-semibold">${Number(bill.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Amount Due:</span>
                  <span>${Number(bill.amountDue).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={bill.status} />
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Payment:</span>
                <StatusBadge status={bill.paymentStatus} />
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium text-gray-900">{bill.vendor.name}</span>
              </div>
              {bill.purchaseOrder && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Source PO:</span>
                  <Link href={`/purchase/orders/${bill.purchaseOrder.id}`} className="text-primary hover:underline">
                    {bill.purchaseOrder.poNumber}
                  </Link>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Created By:</span>
                <span className="font-medium text-gray-900">{bill.createdBy?.name || "User"}</span>
              </div>
            </CardContent>
          </Card>

          {bill.payments && bill.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {bill.payments.map((pm: any) => (
                  <div key={pm.id} className="flex justify-between items-center p-2 rounded bg-gray-50 border">
                    <div>
                      <p className="font-medium text-gray-900">${Number(pm.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{pm.paymentMethod} · {new Date(pm.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">Disbursed</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
