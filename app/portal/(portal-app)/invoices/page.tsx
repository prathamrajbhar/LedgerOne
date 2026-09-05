import Link from "next/link";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@prisma/client";
import { FileText, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function PortalInvoicesPage() {
  const portalSession = await requireCustomerAccess();

  // Fetch invoices for this contact only
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      customerId: portalSession.contactId,
    },
    include: {
      salesOrder: {
        select: {
          soNumber: true,
        },
      },
      lines: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      invoiceDate: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your customer invoices
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm mt-1">You don&apos;t have any invoices yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        invoice.paymentStatus === PaymentStatus.PAID
                          ? "bg-green-100 text-green-700"
                          : invoice.paymentStatus === PaymentStatus.PARTIAL
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.paymentStatus}
                    </span>
                    {invoice.paymentStatus !== PaymentStatus.PAID && (
                      <Link href={`/portal/invoices/${invoice.id}/pay`}>
                        <Button size="sm" className="text-xs h-7 bg-navy hover:bg-navy-dark text-white gap-1.5">
                          <CreditCard className="h-3 w-3" /> Pay Invoice
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">
                      {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-navy text-lg">
                      ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Due</p>
                    <p className="font-bold text-red-600 text-lg">
                      ₹{Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {invoice.salesOrder && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Related Sales Order: <span className="font-medium text-navy">{invoice.salesOrder.soNumber}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Line Items</p>
                  <div className="space-y-2">
                    {invoice.lines.map((line) => (
                      <div key={line.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{line.product.name}</span>
                        <span className="font-medium">
                          {Number(line.quantity)} × ₹{Number(line.unitPrice).toLocaleString("en-IN")} = ₹
                          {Number(line.lineTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
