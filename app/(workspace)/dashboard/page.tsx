import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  try {
    const [invoicesRes, billsRes] = await Promise.all([
      customerInvoiceService.list({ limit: 5 }),
      vendorBillService.list({ limit: 5 }),
    ]);

    const totalRevenue = invoicesRes.data.reduce(
      (sum, inv) => sum + Number(inv.amountPaid || 0),
      0
    );

    const totalExpenses = billsRes.data.reduce(
      (sum, bill) => sum + Number(bill.amountPaid || 0),
      0
    );

    const pendingInvoices = invoicesRes.data.filter(
      (inv) => inv.paymentStatus !== "PAID"
    ).length;

    const pendingBills = billsRes.data.filter(
      (bill) => bill.paymentStatus !== "PAID"
    ).length;

    return {
      totalRevenue,
      totalExpenses,
      pendingInvoices,
      pendingBills,
      recentInvoices: invoicesRes.data,
      recentBills: billsRes.data,
    };
  } catch (error) {
    console.error("Failed to load dashboard metrics:", error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      pendingInvoices: 0,
      pendingBills: 0,
      recentInvoices: [],
      recentBills: [],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time financial overview and business transaction activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/orders/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Sales Order
            </Button>
          </Link>
          <Link href="/purchase/orders/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="h-3 w-3" /> Collected
              </span>{" "}
              from customer invoices
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-blue-600 flex items-center font-medium">
                <ArrowDownRight className="h-3 w-3" /> Disbursed
              </span>{" "}
              to vendor bills
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment settlement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bills</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingBills}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for vendor payment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Customer Invoices</CardTitle>
            <Link href="/sales/invoices" className="text-xs text-primary font-medium hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No recent customer invoices to display.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{inv.customer?.name || "Customer"}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">${inv.total.toString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={inv.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Vendor Bills</CardTitle>
            <Link href="/purchase/bills" className="text-xs text-primary font-medium hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentBills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No recent vendor bills to display.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentBills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{bill.billNumber}</p>
                      <p className="text-xs text-muted-foreground">{bill.vendor?.name || "Vendor"}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">${bill.total.toString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(bill.billDate).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={bill.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
