import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  Send,
  ShoppingBag,
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          loginId: true,
          isActive: true,
        },
      },
      customerInvoices: {
        orderBy: { invoiceDate: "desc" },
      },
      salesOrders: {
        orderBy: { orderDate: "desc" },
      },
      vendorBills: {
        orderBy: { billDate: "desc" },
      },
      purchaseOrders: {
        orderBy: { orderDate: "desc" },
      },
    },
  });

  if (!contact) {
    notFound();
  }

  const isCustomer = contact.type === "CUSTOMER" || contact.type === "BOTH";
  const isVendor = contact.type === "VENDOR" || contact.type === "BOTH";

  // Customer transactions calculation
  const activeInvoices = contact.customerInvoices.filter((inv) => inv.status !== "CANCELLED");
  const customerLifetime = activeInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const customerOutstanding = activeInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0);
  const unpaidInvoices = activeInvoices.filter((inv) => Number(inv.amountDue) > 0);

  // Vendor transactions calculation
  const activeBills = contact.vendorBills.filter((bill) => bill.status !== "CANCELLED");
  const vendorLifetime = activeBills.reduce((sum, bill) => sum + Number(bill.total), 0);
  const vendorOutstanding = activeBills.reduce((sum, bill) => sum + Number(bill.amountDue), 0);
  const unpaidBills = activeBills.filter((bill) => Number(bill.amountDue) > 0);

  // Unified figures based on type
  const lifetimeBusiness = isCustomer ? customerLifetime : vendorLifetime;
  const outstandingBalance = isCustomer ? customerOutstanding : vendorOutstanding;
  const totalInvoicesOrBills = isCustomer ? activeInvoices.length : activeBills.length;
  const totalOrders = isCustomer ? contact.salesOrders.length : contact.purchaseOrders.length;

  // Credit limit evaluation (standard enterprise terms: ₹10,00,000 baseline for active B2B accounts)
  const creditLimit = lifetimeBusiness > 0 ? 1000000 : 0;
  const availableCredit = Math.max(0, creditLimit - outstandingBalance);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <PageHeader
        title={contact.name}
        description={`${
          contact.type === "CUSTOMER"
            ? "Customer"
            : contact.type === "VENDOR"
            ? "Vendor / Supplier"
            : "Customer & Vendor"
        } Record ID: ${contact.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </Link>
            {isCustomer && (
              <Link href="/invoices">
                <Button size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Create Invoice
                </Button>
              </Link>
            )}
            {contact.type === "VENDOR" && (
              <Link href="/bills">
                <Button size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5 text-xs">
                  <Receipt className="h-3.5 w-3.5" />
                  Create Bill
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Dynamic Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outstanding Balance */}
        <Card className="p-4 bg-white shadow-card border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Outstanding Balance</span>
            {outstandingBalance > 0 ? (
              <AlertCircle className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{formatINR(outstandingBalance)}</p>
          <span className="text-[11px] font-medium mt-1 block text-muted-foreground">
            {outstandingBalance > 0
              ? `${isCustomer ? unpaidInvoices.length : unpaidBills.length} Unpaid ${isCustomer ? "Invoice(s)" : "Bill(s)"}`
              : "All Invoices Settled"}
          </span>
        </Card>

        {/* Lifetime Business */}
        <Card className="p-4 bg-white shadow-card border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Lifetime Business</span>
            <TrendingUp className="h-4 w-4 text-navy" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{formatINR(lifetimeBusiness)}</p>
          <span className="text-[11px] font-medium mt-1 block text-muted-foreground">
            {totalInvoicesOrBills > 0
              ? `${totalInvoicesOrBills} ${isCustomer ? "Invoice(s)" : "Bill(s)"} • ${totalOrders} Order(s)`
              : "No Orders Yet"}
          </span>
        </Card>

        {/* Credit Limit & Terms */}
        <Card className="p-4 bg-white shadow-card border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Credit Limit</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded">
              Net 30
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">
            {creditLimit > 0 ? formatINR(creditLimit) : "₹0"}
          </p>
          <span className="text-[11px] font-medium mt-1 block text-muted-foreground">
            {creditLimit > 0 ? `${formatINR(availableCredit)} Available Credit` : "Standard Pre-paid"}
          </span>
        </Card>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 bg-white shadow-card border-border/80">
          <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center justify-between">
            <span>Contact Information</span>
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold text-foreground truncate">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold text-foreground">{contact.phone}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground shrink-0">Address:</span>
                <span className="font-semibold text-foreground leading-relaxed">{contact.address}</span>
              </div>
            )}
            {!contact.phone && !contact.address && (
              <p className="text-muted-foreground italic">No additional contact details available</p>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white shadow-card border-border/80">
          <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
            Account Details
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Contact Type</span>
              <Badge
                variant={contact.type === "CUSTOMER" ? "default" : contact.type === "VENDOR" ? "secondary" : "outline"}
                className="text-[10px] mt-0.5"
              >
                {contact.type === "CUSTOMER"
                  ? "Customer"
                  : contact.type === "VENDOR"
                  ? "Vendor"
                  : "Customer & Vendor"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Portal Status</span>
              <Badge
                variant={contact.user?.isActive ? "success" : "secondary"}
                className="text-[10px] mt-0.5"
              >
                {contact.user?.isActive ? "Active Portal Access" : "No Portal Access"}
              </Badge>
            </div>
            {contact.user && (
              <div className="pt-2">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs w-full">
                  <Send className="h-3.5 w-3.5" />
                  Resend Portal Login Details
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-5">
        {/* Customer Invoices / Vendor Bills */}
        <Card className="bg-white shadow-card border-border/80 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-navy" />
              <h3 className="text-sm font-bold text-foreground">
                {isCustomer ? "Invoices on Record" : "Vendor Bills on Record"}
              </h3>
              <Badge variant="outline" className="text-[10px] ml-1 font-mono">
                {totalInvoicesOrBills}
              </Badge>
            </div>
            <Link href={isCustomer ? "/invoices" : "/bills"}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-navy hover:text-navy/80">
                View All <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {isCustomer ? (
            activeInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No customer invoices generated for this account yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Invoice #</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-right">Due</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {activeInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-navy">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(inv.invoiceDate), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(inv.dueDate), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          {formatINR(Number(inv.total))}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-destructive">
                          {Number(inv.amountDue) > 0 ? formatINR(Number(inv.amountDue)) : "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={inv.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            activeBills.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No vendor bills on record for this account yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Bill #</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-right">Due</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {activeBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-navy">
                          {bill.billNumber}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(bill.billDate), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(bill.dueDate), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          {formatINR(Number(bill.total))}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-destructive">
                          {Number(bill.amountDue) > 0 ? formatINR(Number(bill.amountDue)) : "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={bill.status} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={bill.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Card>

        {/* Sales Orders / Purchase Orders */}
        {(contact.salesOrders.length > 0 || contact.purchaseOrders.length > 0) && (
          <Card className="bg-white shadow-card border-border/80 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-navy" />
                <h3 className="text-sm font-bold text-foreground">
                  {isCustomer ? "Sales Orders" : "Purchase Orders"}
                </h3>
                <Badge variant="outline" className="text-[10px] ml-1 font-mono">
                  {totalOrders}
                </Badge>
              </div>
              <Link href={isCustomer ? "/sales" : "/purchases"}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-navy hover:text-navy/80">
                  View All <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4">Order Date</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(isCustomer ? contact.salesOrders : contact.purchaseOrders).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-navy">
                        {"soNumber" in order ? order.soNumber : order.poNumber}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {format(new Date(order.orderDate), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">
                        {formatINR(Number(order.total))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
