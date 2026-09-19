import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Percent, Layers, FileText, ArrowUpRight } from "lucide-react";

export default async function TaxRateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const taxRate = await prisma.taxRate.findUnique({
    where: { id: params.id },
    include: {
      salesOrderLines: {
        include: {
          salesOrder: true,
          product: true,
        },
        take: 10,
        orderBy: { id: "desc" },
      },
      invoiceLines: {
        include: {
          invoice: true,
          product: true,
        },
        take: 10,
        orderBy: { id: "desc" },
      },
    },
  });

  if (!taxRate) {
    notFound();
  }

  const applicabilityLabel = (app: string) => {
    switch (app) {
      case "SALES":
        return "Sales Orders & Invoicing Only";
      case "PURCHASE":
        return "Purchase Orders & Vendor Bills Only";
      case "BOTH":
        return "Universal (Sales & Purchases)";
      default:
        return app;
    }
  };

  const totalUsages = taxRate.salesOrderLines.length + taxRate.invoiceLines.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="space-y-3">
        <Link
          href="/tax-rates"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Tax Rates
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-navy">
                {taxRate.name}
              </h1>
              <Badge variant="outline" className="text-xs bg-[#F6F7F9]">
                {taxRate.percentage.toString()}%
              </Badge>
              <Badge variant="success" className="text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applicability: <span className="font-semibold text-foreground">{applicabilityLabel(taxRate.applicability)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Statutory Tax Rate</span>
            <span className="text-xl font-bold text-foreground">{taxRate.percentage.toString()}%</span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Recent Transactions</span>
            <span className="text-xl font-bold text-foreground">{totalUsages} tracked</span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Tax Scope</span>
            <span className="text-sm font-bold text-foreground">{taxRate.applicability}</span>
          </div>
        </Card>
      </div>

      {/* Recent Invoices using this Tax Rate */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Customer Invoices Using this Tax Rate</h3>
            <p className="text-xs text-muted-foreground">
              Invoices where this tax percentage was assessed.
            </p>
          </div>
        </div>

        {taxRate.invoiceLines.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No recent customer invoices found with this tax rate applied.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Tax Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {taxRate.invoiceLines.map((l) => (
                  <tr key={l.id} className="hover:bg-primary-light/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">
                      {l.invoice.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{l.product.name}</td>
                    <td className="py-2.5 px-3 text-center">{Number(l.quantity)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{Number(l.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                      ₹{Number(l.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Link
                        href={`/invoices/${l.invoice.id}`}
                        className="inline-flex items-center gap-1 text-xs text-navy font-semibold hover:underline"
                      >
                        View Invoice <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
