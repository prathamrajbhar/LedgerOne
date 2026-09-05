import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RecordInvoicePaymentDialog } from "./record-payment-dialog";

export const dynamic = "force-dynamic";

export default async function CustomerInvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let invoice;
  try {
    invoice = await customerInvoiceService.findById(params.id);
  } catch {
    notFound();
  }

  async function confirmInvoice() {
    "use server";
    await customerInvoiceService.confirm(params.id);
    revalidatePath(`/sales/invoices/${params.id}`);
    revalidatePath("/sales/invoices");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Customer Invoice: ${invoice.invoiceNumber}`}
        description={`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()} · Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/sales/invoices">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {invoice.status === "DRAFT" && (
              <form action={confirmInvoice}>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4" /> Confirm Invoice
                </Button>
              </form>
            )}
            {invoice.status === "CONFIRMED" && Number(invoice.amountDue) > 0 && (
              <RecordInvoicePaymentDialog
                invoiceId={invoice.id}
                amountDue={Number(invoice.amountDue)}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Invoiced Items</CardTitle>
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
                  {invoice.lines.map((line) => (
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
                  <span className="font-semibold text-gray-900">${Number(invoice.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="text-emerald-600 font-semibold">${Number(invoice.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Amount Due:</span>
                  <span>${Number(invoice.amountDue).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Payment:</span>
                <StatusBadge status={invoice.paymentStatus} />
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-gray-900">{invoice.customer.name}</span>
              </div>
              {invoice.salesOrder && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Source SO:</span>
                  <Link href={`/sales/orders/${invoice.salesOrder.id}`} className="text-primary hover:underline">
                    {invoice.salesOrder.soNumber}
                  </Link>
                </div>
              )}
              {invoice.invoiceReference && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium text-gray-900">{invoice.invoiceReference}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Created By:</span>
                <span className="font-medium text-gray-900">{invoice.createdBy?.name || "User"}</span>
              </div>
            </CardContent>
          </Card>

          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Receipts & Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {invoice.payments.map((pm: any) => (
                  <div key={pm.id} className="flex justify-between items-center p-2 rounded bg-gray-50 border">
                    <div>
                      <p className="font-medium text-gray-900">${Number(pm.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{pm.paymentMethod} · {new Date(pm.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">Received</span>
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
