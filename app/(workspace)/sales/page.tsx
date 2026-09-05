"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

export default function SalesOrdersPage() {
  const salesOrders = [
    { id: "SO-101", customer: "Modern Living Interiors", date: "18 Nov 2024", items: 4, total: 125000, status: "CONFIRMED" },
    { id: "SO-100", customer: "Urban Deck Architectural", date: "14 Nov 2024", items: 2, total: 96000, status: "PAID" },
    { id: "SO-099", customer: "Prestige Executive Suites", date: "08 Nov 2024", items: 12, total: 215000, status: "PENDING" },
    { id: "SO-098", customer: "HomeSpace Furniture", date: "02 Nov 2024", items: 3, total: 75000, status: "PAID" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Orders"
        description="Furniture sales orders, quotations, confirmed order bookings, and fulfillment status."
        actions={
          <Link href="/invoices">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Sales Order
            </Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Order Date</th>
              <th className="py-3.5 px-4 text-center">Items Count</th>
              <th className="py-3.5 px-4 text-right">Order Total</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {salesOrders.map((so) => (
              <tr key={so.id} className="hover:bg-primary-light/30">
                <td className="py-3.5 px-4 font-mono font-bold text-navy">{so.id}</td>
                <td className="py-3.5 px-4 font-semibold text-foreground">{so.customer}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{so.date}</td>
                <td className="py-3.5 px-4 text-center text-muted-foreground">{so.items} units</td>
                <td className="py-3.5 px-4 text-right font-bold text-foreground">
                  ₹{so.total.toLocaleString("en-IN")}.00
                </td>
                <td className="py-3.5 px-4 text-center"><StatusBadge status={so.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
