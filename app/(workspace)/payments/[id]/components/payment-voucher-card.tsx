import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, User, FileText, ArrowUpRight } from "lucide-react";
import type { SerializedPaymentRecord } from "../types";

export function PaymentVoucherCard({ payment }: { payment: SerializedPaymentRecord }) {
  const isInbound = payment.direction === "INBOUND";
  const docUrl = payment.settledDocument.type === "INVOICE"
    ? `/invoices/${payment.settledDocument.id}`
    : `/bills/${payment.settledDocument.id}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Payment Amount & Confirmation */}
      <Card className="p-5 bg-white shadow-card space-y-4 border-l-4 border-l-teal">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-teal/10 text-teal flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-bold">
              Amount Settled
            </span>
            <h2 className="text-2xl font-extrabold text-navy">
              ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-2 border-t border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Disbursement Account:</span>
            <span className="font-semibold text-foreground">{payment.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode of Payment:</span>
            <span className="font-medium text-foreground">{payment.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source / Channel:</span>
            <span className="font-mono text-muted-foreground">{payment.source}</span>
          </div>
          {payment.note && (
            <div className="pt-2">
              <span className="text-muted-foreground block text-[11px]">Voucher Memo:</span>
              <p className="text-foreground bg-[#F9FAFB] p-2 rounded border border-border mt-0.5">
                {payment.note}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Customer / Vendor Party Profile */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-navy" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              {isInbound ? "Customer (Remitter)" : "Vendor (Beneficiary)"}
            </h3>
          </div>
          <Link
            href={`/contacts/${payment.party.id}`}
            className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
          >
            Contact Profile <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="font-bold text-sm text-foreground">{payment.party.name}</p>
          {payment.party.email && (
            <p className="text-muted-foreground">{payment.party.email}</p>
          )}
          {payment.party.phone && (
            <p className="text-muted-foreground">{payment.party.phone}</p>
          )}
          {payment.party.address && (
            <p className="text-muted-foreground">{payment.party.address}</p>
          )}
          {payment.party.gstin && (
            <p className="text-muted-foreground pt-1">
              <span className="font-medium text-foreground">GSTIN:</span> {payment.party.gstin}
            </p>
          )}
        </div>
      </Card>

      {/* 3. Settled Document (Invoice / Bill) */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-navy" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Settled Document
            </h3>
          </div>
          <Link
            href={docUrl}
            className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
          >
            View {payment.settledDocument.type === "INVOICE" ? "Invoice" : "Bill"} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold text-navy text-sm">
              {payment.settledDocument.number}
            </span>
            <StatusBadge status={payment.settledDocument.status} />
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Document Total:</span>
            <span className="font-mono font-semibold text-foreground">
              ₹{payment.settledDocument.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Cumulative Paid:</span>
            <span className="font-mono font-semibold text-success">
              ₹{payment.settledDocument.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground pt-1 border-t border-border">
            <span>Remaining Due:</span>
            <span className="font-mono font-bold text-warning">
              ₹{payment.settledDocument.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
