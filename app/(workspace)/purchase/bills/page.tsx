import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { VendorBillsTable } from "./vendor-bills-table";

export const dynamic = "force-dynamic";

export default async function VendorBillsPage({
  searchParams,
}: {
  searchParams: { status?: string; paymentStatus?: string; vendor?: string; page?: string };
}) {
  const bills = await vendorBillService.list({
    status: searchParams.status as any,
    paymentStatus: searchParams.paymentStatus as any,
    vendorId: searchParams.vendor,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Bills"
        description="Review incoming vendor invoices, verify dues, and process disbursements."
        actions={
          <Link href="/purchase/bills/new">
            <Button size="sm" className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Vendor Bill
            </Button>
          </Link>
        }
      />
      <VendorBillsTable data={bills} />
    </div>
  );
}
