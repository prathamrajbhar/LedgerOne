import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";
import { getVendorBillsAction } from "@/app/actions/purchase.actions";
import { VendorBillForm } from "./vendor-bill-form";
import { VendorBillRow } from "./vendor-bill-row";

export default async function VendorBillsPage() {
  const result = await getVendorBillsAction();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Vendor Bills"
          description="Track and manage vendor bills and payables."
        />
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">Failed to load vendor bills. Please try again.</p>
        </div>
      </div>
    );
  }

  const vendorBills = result.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vendor Bills"
        description="Track and manage vendor bills and payables."
        actions={<VendorBillForm />}
      />

      {vendorBills.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-2">No Vendor Bills</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first vendor bill to start tracking payables.
          </p>
          <VendorBillForm />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="py-3.5 px-4">Bill Number</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Bill Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
                <th className="py-3.5 px-4 text-right">Amount Paid (₹)</th>
                <th className="py-3.5 px-4 text-right">Amount Due (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendorBills.map((bill) => (
                <VendorBillRow
                  key={bill.id}
                  bill={{
                    ...bill,
                    total: Number(bill.total),
                    amountPaid: Number(bill.amountPaid),
                    amountDue: Number(bill.amountDue),
                    billDate: bill.billDate instanceof Date ? bill.billDate.toISOString() : String(bill.billDate),
                    dueDate: bill.dueDate instanceof Date ? bill.dueDate.toISOString() : String(bill.dueDate),
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
