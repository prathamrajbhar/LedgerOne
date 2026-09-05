import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { CustomerInvoicesTable } from "./customer-invoices-table";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string; paymentStatus?: string; customer?: string; page?: string };
}) {
  const invoices = await customerInvoiceService.list({
    status: searchParams.status as any,
    paymentStatus: searchParams.paymentStatus as any,
    customerId: searchParams.customer,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices"
        description="Issue invoices, track payment receipts, and review accounts receivable."
        actions={
          <Link href="/sales/invoices/new">
            <Button size="sm" className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Customer Invoice
            </Button>
          </Link>
        }
      />
      <CustomerInvoicesTable data={invoices} />
    </div>
  );
}
