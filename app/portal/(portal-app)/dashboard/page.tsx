import { auth } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { PrismaClient, ContactType, PaymentStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, DollarSign, Clock } from "lucide-react";

const prisma = new PrismaClient();

async function getCustomerDashboardData(contactId: string) {
  // Get invoices for this customer
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      customerId: contactId,
    },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      dueDate: true,
      total: true,
      amountDue: true,
      paymentStatus: true,
      status: true,
    },
    orderBy: {
      invoiceDate: "desc",
    },
    take: 5,
  });

  const totalInvoices = await prisma.customerInvoice.count({
    where: { customerId: contactId },
  });

  const totalAmountDue = await prisma.customerInvoice.aggregate({
    where: {
      customerId: contactId,
      paymentStatus: {
        in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL],
      },
    },
    _sum: {
      amountDue: true,
    },
  });

  const recentPayments = await prisma.invoicePayment.count({
    where: {
      invoice: {
        customerId: contactId,
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  return {
    invoices,
    totalInvoices,
    totalAmountDue: totalAmountDue._sum.amountDue || 0,
    recentPayments,
  };
}

async function getVendorDashboardData(contactId: string) {
  // Get bills for this vendor
  const bills = await prisma.vendorBill.findMany({
    where: {
      vendorId: contactId,
    },
    select: {
      id: true,
      billNumber: true,
      billDate: true,
      dueDate: true,
      total: true,
      amountDue: true,
      paymentStatus: true,
      status: true,
    },
    orderBy: {
      billDate: "desc",
    },
    take: 5,
  });

  const totalBills = await prisma.vendorBill.count({
    where: { vendorId: contactId },
  });

  const totalAmountDue = await prisma.vendorBill.aggregate({
    where: {
      vendorId: contactId,
      paymentStatus: {
        in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL],
      },
    },
    _sum: {
      amountDue: true,
    },
  });

  const recentPayments = await prisma.billPayment.count({
    where: {
      vendorBill: {
        vendorId: contactId,
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  return {
    bills,
    totalBills,
    totalAmountDue: totalAmountDue._sum.amountDue || 0,
    recentPayments,
  };
}

export default async function PortalDashboardPage() {
  const session = await auth();

  if (!session?.user?.contactId) {
    redirect("/portal/login");
  }

  const contactId = session.user.contactId;
  const contactType = session.user.contactType || ContactType.CUSTOMER;
  const contactName = session.user.contactName || "User";

  // Fetch data based on contact type
  const isCustomer = contactType === ContactType.CUSTOMER || contactType === ContactType.BOTH;
  const isVendor = contactType === ContactType.VENDOR || contactType === ContactType.BOTH;

  const customerData = isCustomer ? await getCustomerDashboardData(contactId) : null;
  const vendorData = isVendor ? await getVendorDashboardData(contactId) : null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Welcome back, {contactName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your account activity
        </p>
      </div>

      {/* Customer Summary Cards */}
      {isCustomer && customerData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{customerData.totalInvoices}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Amount Due
                </CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  ₹{customerData.totalAmountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Payments
                </CardTitle>
                <Receipt className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{customerData.recentPayments}</div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Invoices
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  {customerData.invoices.filter((inv) => inv.paymentStatus !== PaymentStatus.PAID).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {customerData.invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No invoices found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerData.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-navy">{invoice.invoiceNumber}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              invoice.paymentStatus === PaymentStatus.PAID
                                ? "bg-green-100 text-green-700"
                                : invoice.paymentStatus === PaymentStatus.PARTIAL
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {invoice.paymentStatus}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")} | Due:{" "}
                          {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-navy">
                          ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        {Number(invoice.amountDue) > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Due: ₹{Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Vendor Summary Cards */}
      {isVendor && vendorData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bills
                </CardTitle>
                <Receipt className="h-4 w-4 text-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{vendorData.totalBills}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Amount Receivable
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  ₹{vendorData.totalAmountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pending from company</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Payments Received
                </CardTitle>
                <Receipt className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{vendorData.recentPayments}</div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Bills
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  {vendorData.bills.filter((bill) => bill.paymentStatus !== PaymentStatus.PAID).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorData.bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No bills found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorData.bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-navy">{bill.billNumber}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
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
                        <p className="text-sm text-muted-foreground mt-1">
                          Date: {new Date(bill.billDate).toLocaleDateString("en-IN")} | Due:{" "}
                          {new Date(bill.dueDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-navy">
                          ₹{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        {Number(bill.amountDue) > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Pending: ₹{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
