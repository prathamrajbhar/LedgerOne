import { auth } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { ContactType, PaymentStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { FileText, Receipt, CircleDollarSign, Clock, ArrowRight, CreditCard, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

async function getCustomerDashboardData(contactId: string) {
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
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return {
    invoices,
    totalInvoices,
    totalAmountDue: Number(totalAmountDue._sum.amountDue || 0),
    recentPayments,
  };
}

async function getVendorDashboardData(contactId: string) {
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
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return {
    bills,
    totalBills,
    totalAmountDue: Number(totalAmountDue._sum.amountDue || 0),
    recentPayments,
  };
}

export default async function PortalDashboardPage() {
  const session = await auth();

  if (!session?.user?.contactId) {
    redirect("/login");
  }

  const contactId = session.user.contactId;
  const contactType = session.user.contactType || ContactType.CUSTOMER;
  const contactName = session.user.contactName || session.user.name || "Partner";

  const isCustomer = contactType === ContactType.CUSTOMER || contactType === ContactType.BOTH;
  const isVendor = contactType === ContactType.VENDOR || contactType === ContactType.BOTH;

  const customerData = isCustomer ? await getCustomerDashboardData(contactId) : null;
  const vendorData = isVendor ? await getVendorDashboardData(contactId) : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-navy">
            Welcome back, {contactName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Here is a comprehensive overview of your billing, invoices, and payment activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCustomer && (
            <Link href="/portal/billing">
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                <FileText className="h-3.5 w-3.5 text-teal" />
                <span>My Billing</span>
              </Button>
            </Link>
          )}
          {isVendor && (
            <Link href="/portal/bills">
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                <Receipt className="h-3.5 w-3.5 text-teal" />
                <span>View Bills</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* CUSTOMER SECTION */}
      {isCustomer && customerData && (
        <div className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invoices */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Total Invoices
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tnum">
                  {customerData.totalInvoices}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">All time issued</p>
              </div>
            </Card>

            {/* Amount Due */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Amount Due
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-destructive tracking-tight tnum">
                  ₹{customerData.totalAmountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding balance</p>
              </div>
            </Card>

            {/* Recent Payments */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
                  <Receipt className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Recent Payments
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tnum">
                  {customerData.recentPayments}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Last 30 days completed</p>
              </div>
            </Card>

            {/* Pending Invoices */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF8E6] text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Pending Invoices
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-navy tracking-tight tnum">
                  {customerData.invoices.filter((inv) => inv.paymentStatus !== PaymentStatus.PAID).length}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting settlement</p>
              </div>
            </Card>
          </div>

          {/* Recent Invoices Card */}
          <Card className="border border-border bg-white shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-navy">Recent Invoices</h2>
                <p className="text-xs text-muted-foreground">Latest invoices generated for your account</p>
              </div>
              <Link
                href="/portal/billing"
                className="text-xs font-semibold text-teal hover:text-teal-dark flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {customerData.invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm font-medium">No invoices found</p>
                <p className="text-xs text-muted-foreground mt-0.5">You have no invoices issued yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {customerData.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-navy">{invoice.invoiceNumber}</span>
                        <StatusBadge status={invoice.paymentStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Issued: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")} • Due:{" "}
                        <span className="font-medium text-foreground">{new Date(invoice.dueDate).toLocaleDateString("en-IN")}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <div className="font-bold text-navy text-sm sm:text-base tnum">
                          ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        {Number(invoice.amountDue) > 0 ? (
                          <div className="text-[11px] font-medium text-destructive tnum">
                            Due: ₹{Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <div className="text-[11px] font-medium text-green-600 flex items-center gap-1 sm:justify-end">
                            <CheckCircle2 className="h-3 w-3" /> Fully Paid
                          </div>
                        )}
                      </div>

                      {invoice.paymentStatus !== PaymentStatus.PAID && (
                        <Link href={`/portal/invoices/${invoice.id}/pay`}>
                          <Button size="sm" className="h-8 text-xs bg-navy hover:bg-navy-dark text-white gap-1.5 shadow-xs">
                            <CreditCard className="h-3 w-3" /> Pay
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VENDOR SECTION */}
      {isVendor && vendorData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Bills */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal">
                  <Receipt className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Total Vendor Bills
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tnum">
                  {vendorData.totalBills}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Submitted bills</p>
              </div>
            </Card>

            {/* Total Pending Payout */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#6366F1]">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Pending Payout
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-navy tracking-tight tnum">
                  ₹{vendorData.totalAmountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Payable balance</p>
              </div>
            </Card>

            {/* Recent Payments Received */}
            <Card className="p-4 hover:border-border-strong transition-all bg-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Payments Received
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tnum">
                  {vendorData.recentPayments}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Last 30 days cleared</p>
              </div>
            </Card>
          </div>

          {/* Recent Bills Card */}
          <Card className="border border-border bg-white shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-navy">Recent Vendor Bills</h2>
                <p className="text-xs text-muted-foreground">Bills submitted to LedgerOne for settlement</p>
              </div>
              <Link
                href="/portal/bills"
                className="text-xs font-semibold text-teal hover:text-teal-dark flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {vendorData.bills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm font-medium">No bills found</p>
                <p className="text-xs text-muted-foreground mt-0.5">No vendor bills recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {vendorData.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-navy">{bill.billNumber}</span>
                        <StatusBadge status={bill.paymentStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Bill Date: {new Date(bill.billDate).toLocaleDateString("en-IN")} • Due:{" "}
                        <span className="font-medium text-foreground">{new Date(bill.dueDate).toLocaleDateString("en-IN")}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-bold text-navy text-sm sm:text-base tnum">
                        ₹{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      {Number(bill.amountDue) > 0 ? (
                        <div className="text-[11px] font-medium text-amber-600 tnum">
                          Pending: ₹{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-green-600 flex items-center gap-1 sm:justify-end">
                          <CheckCircle2 className="h-3 w-3" /> Fully Cleared
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
