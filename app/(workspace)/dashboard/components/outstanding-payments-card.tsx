"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Users, Building2, ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import type { OutstandingPayments } from "@/app/actions/dashboard.actions";

interface OutstandingPaymentsCardProps {
  outstandingPayments: OutstandingPayments;
}

export function OutstandingPaymentsCard({
  outstandingPayments,
}: OutstandingPaymentsCardProps) {
  return (
    <Card className="p-5 bg-white shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold text-foreground">
          Outstanding Payments
        </CardTitle>
        <Link
          href="/payments"
          className="text-xs font-semibold text-teal hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-2.5 pt-3">
        {/* Overdue Invoices */}
        <Link
          href="/invoices?paymentStatus=OVERDUE"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FDEEEE] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Overdue Invoices
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-destructive">
              {outstandingPayments.overdueInvoices.count}
            </span>
            <span className="text-xs font-bold text-foreground">
              ₹{outstandingPayments.overdueInvoices.amount.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Pending Invoices */}
        <Link
          href="/invoices?paymentStatus=PENDING"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF7E6] text-warning">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Pending Invoices
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-warning">
              {outstandingPayments.pendingInvoices.count}
            </span>
            <span className="text-xs font-bold text-foreground">
              ₹{outstandingPayments.pendingInvoices.amount.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Receivables (Customers) */}
        <Link
          href="/contacts?type=CUSTOMER"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EDF5FC] text-[#3478B9]">
              <Users className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Receivables (Customers)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#3478B9]">
              {outstandingPayments.receivables.count}
            </span>
            <span className="text-xs font-bold text-foreground">
              ₹{outstandingPayments.receivables.amount.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Payables (Suppliers) */}
        <Link
          href="/contacts?type=VENDOR"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F0EEFF] text-[#6366F1]">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Payables (Suppliers)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#6366F1]">
              {outstandingPayments.payables.count}
            </span>
            <span className="text-xs font-bold text-foreground">
              ₹{outstandingPayments.payables.amount.toLocaleString("en-IN")}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </Card>
  );
}
