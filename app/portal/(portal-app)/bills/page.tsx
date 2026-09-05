import { requireVendorAccess } from "@/lib/auth/portal-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient, PaymentStatus } from "@prisma/client";
import { Receipt } from "lucide-react";

const prisma = new PrismaClient();

export default async function PortalBillsPage() {
  const portalSession = await requireVendorAccess();

  // Fetch bills for this contact only
  const bills = await prisma.vendorBill.findMany({
    where: {
      vendorId: portalSession.contactId,
    },
    include: {
      purchaseOrder: {
        select: {
          poNumber: true,
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
      billDate: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Bills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your vendor bills and payment status
        </p>
      </div>

      {bills.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Receipt className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No bills found</p>
              <p className="text-sm mt-1">You don&apos;t have any bills yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card key={bill.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {bill.billNumber}
                  </CardTitle>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      bill.paymentStatus === PaymentStatus.PAID
                        ? "bg-green-100 text-green-700"
                        : bill.paymentStatus === PaymentStatus.PARTIAL
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {bill.paymentStatus}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Bill Date</p>
                    <p className="font-medium">
                      {new Date(bill.billDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {new Date(bill.dueDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-navy text-lg">
                      ₹{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Pending</p>
                    <p className="font-bold text-orange-600 text-lg">
                      ₹{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {bill.purchaseOrder && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Related Purchase Order: <span className="font-medium text-navy">{bill.purchaseOrder.poNumber}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Line Items</p>
                  <div className="space-y-2">
                    {bill.lines.map((line) => (
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
