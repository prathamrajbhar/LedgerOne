"use client";

import * as React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { FileText, Building, CreditCard } from "lucide-react";
import { SerializedBillData } from "../types";

interface BillVendorInfoProps {
  bill: SerializedBillData;
}

export function BillVendorInfo({ bill }: BillVendorInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Bill Metadata */}
      <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-navy" /> Bill Information
        </CardTitle>
        <div className="space-y-2 pt-1">
          <div className="flex justify-between border-b border-border/50 pb-1.5">
            <span className="text-muted-foreground">Bill Number:</span>
            <span className="font-mono font-bold text-navy">{bill.billNumber}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1.5">
            <span className="text-muted-foreground">Issue Date:</span>
            <span>
              {new Date(bill.billDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1.5">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-semibold text-foreground">
              {new Date(bill.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {bill.purchaseOrder && (
            <div className="flex justify-between pt-0.5">
              <span className="text-muted-foreground">Purchase Order:</span>
              <span className="font-semibold text-navy">
                {bill.purchaseOrder.poNumber}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Vendor Profile */}
      <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Building className="w-3.5 h-3.5 text-navy" /> Vendor Profile
        </CardTitle>
        <div className="space-y-2 pt-1">
          <p className="font-bold text-sm text-navy">{bill.vendor.name}</p>
          <div className="text-muted-foreground space-y-1">
            <p>Email: {bill.vendor.email || "No email on record"}</p>
            <p>Phone: {bill.vendor.phone || "No phone on record"}</p>
          </div>
        </div>
      </Card>

      {/* Vendor Tax & Address */}
      <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5 text-navy" /> Address & Tax Identification
        </CardTitle>
        <div className="space-y-2 pt-1 text-muted-foreground">
          {bill.vendor.address ? (
            <p className="whitespace-pre-line leading-relaxed">{bill.vendor.address}</p>
          ) : (
            <p className="italic">Vendor address not provided</p>
          )}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-navy">GST Compliance:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              Verified Active
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
