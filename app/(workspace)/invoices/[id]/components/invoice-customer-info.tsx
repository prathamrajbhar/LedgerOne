"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SerializedInvoiceData } from "../types";
import { User, FileText, MapPin } from "lucide-react";
import Link from "next/link";

interface InvoiceCustomerInfoProps {
  invoice: SerializedInvoiceData;
}

export function InvoiceCustomerInfo({ invoice }: InvoiceCustomerInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Invoice Meta Card */}
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
          <FileText className="h-4 w-4 text-navy/70" />
          Invoice Overview
        </div>
        <div className="space-y-2 text-xs divide-y divide-border/50">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-mono font-semibold text-navy">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Invoice Date</span>
            <span className="font-medium">
              {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Payment Due</span>
            <span className="font-medium">
              {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {invoice.salesOrder && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Source Order</span>
              <span className="font-semibold text-navy">{invoice.salesOrder.soNumber}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Customer Card */}
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
            <User className="h-4 w-4 text-navy/70" />
            Customer Details
          </div>
          {invoice.customer.id && (
            <Link
              href={`/contacts/${invoice.customer.id}`}
              className="text-[11px] text-navy font-medium hover:underline"
            >
              View Profile
            </Link>
          )}
        </div>
        <div className="space-y-1.5 text-xs">
          <p className="font-bold text-navy text-sm">{invoice.customer.name}</p>
          <div className="text-muted-foreground space-y-0.5">
            <p>{invoice.customer.email || "No email registered"}</p>
            <p>{invoice.customer.phone || "No phone registered"}</p>
          </div>
        </div>
      </Card>

      {/* 3. Billing Address Card */}
      <Card className="p-4 bg-white border border-border rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy uppercase tracking-wider">
          <MapPin className="h-4 w-4 text-navy/70" />
          Billing Address
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {invoice.customer.address ? (
            <p className="whitespace-pre-line">{invoice.customer.address}</p>
          ) : (
            <p className="italic text-muted-foreground/80">No billing address specified for customer</p>
          )}
        </div>
      </Card>
    </div>
  );
}
