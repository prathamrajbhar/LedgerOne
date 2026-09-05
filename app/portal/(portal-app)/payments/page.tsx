import { requirePortalAuth } from "@/lib/auth/portal-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient, ContactType } from "@prisma/client";
import { CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react";

const prisma = new PrismaClient();

export default async function PortalPaymentsPage() {
  const portalSession = await requirePortalAuth();

  const isCustomer =
    portalSession.contactType === ContactType.CUSTOMER ||
    portalSession.contactType === ContactType.BOTH;
  const isVendor =
    portalSession.contactType === ContactType.VENDOR ||
    portalSession.contactType === ContactType.BOTH;

  // Fetch customer payments (payments made by contact)
  const customerPayments = isCustomer
    ? await prisma.invoicePayment.findMany({
        where: {
          invoice: {
            customerId: portalSession.contactId,
          },
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              invoiceDate: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })
    : [];

  // Fetch vendor payments (payments received by contact)
  const vendorPayments = isVendor
    ? await prisma.billPayment.findMany({
        where: {
          vendorBill: {
            vendorId: portalSession.contactId,
          },
        },
        include: {
          vendorBill: {
            select: {
              billNumber: true,
              billDate: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Payment History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all your payment transactions
        </p>
      </div>

      {/* Customer Payments Section */}
      {isCustomer && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg font-semibold">Payments Made</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Payments you made for your invoices
            </p>
          </CardHeader>
          <CardContent>
            {customerPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No payments made yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy">
                          {payment.invoice.invoiceNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Payment Date: {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 text-lg">
                        -₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendor Payments Section */}
      {isVendor && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg font-semibold">Payments Received</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Payments received from the company
            </p>
          </CardHeader>
          <CardContent>
            {vendorPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No payments received yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy">
                          {payment.vendorBill.billNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Payment Date: {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        +₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
