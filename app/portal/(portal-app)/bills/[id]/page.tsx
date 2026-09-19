import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireVendorAccess } from "@/lib/auth/portal-session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowLeft, FileText } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";

export default async function PortalBillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const portalSession = await requireVendorAccess();

  const bill = await prisma.vendorBill.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      purchaseOrder: { select: { poNumber: true } },
      lines: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!bill || bill.vendorId !== portalSession.contactId) {
    notFound();
  }

  const total = Number(bill.total);
  const amountPaid = Number(bill.amountPaid);
  const amountDue = Number(bill.amountDue);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="space-y-3">
        <Link
          href="/portal/bills"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Vendor Bills
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-navy">
                Vendor Bill #{bill.billNumber}
              </h1>
              <StatusBadge status={bill.paymentStatus} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bill Date: {new Date(bill.billDate).toLocaleDateString("en-IN")} • Due on{" "}
              {new Date(bill.dueDate).toLocaleDateString("en-IN")}
              {bill.purchaseOrder?.poNumber && ` • PO Ref: ${bill.purchaseOrder.poNumber}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium block">Total Bill Amount</span>
          <span className="text-xl font-bold text-navy">
            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium block">Amount Disbursed</span>
          <span className="text-xl font-bold text-emerald-600">
            ₹{amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium block">Outstanding Balance</span>
          <span className={`text-xl font-bold ${amountDue > 0 ? "text-amber-600" : "text-foreground"}`}>
            ₹{amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </Card>
      </div>

      {/* Itemized Lines */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FileText className="h-4 w-4 text-navy" />
          <h3 className="text-sm font-bold text-foreground">Supplied Material Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                <th className="py-2.5 px-3">Material / SKU</th>
                <th className="py-2.5 px-3 text-center">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bill.lines.map((l) => (
                <tr key={l.id} className="hover:bg-primary-light/20">
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-foreground block">{l.product.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">SKU: {l.product.sku}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-foreground">{Number(l.quantity)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ₹{Number(l.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                    ₹{Number(l.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
