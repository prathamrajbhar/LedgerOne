"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SerializedPaymentRecord } from "../types";

export function PaymentHeader({ payment }: { payment: SerializedPaymentRecord }) {
  const isInbound = payment.direction === "INBOUND";

  return (
    <div className="space-y-3">
      <Link
        href="/payments"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Payments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              {isInbound ? "Receipt Voucher" : "Payment Voucher"} #{payment.ref}
            </h1>
            <Badge
              variant={isInbound ? "success" : "secondary"}
              className="text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1"
            >
              {isInbound ? (
                <>
                  <ArrowDownLeft className="h-3 w-3" /> Inbound Customer Receipt
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3 w-3" /> Outbound Vendor Payment
                </>
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Recorded on{" "}
            {new Date(payment.paymentDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            via <span className="font-semibold text-foreground">{payment.paymentMethod}</span> ({payment.accountName})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Voucher
          </Button>
        </div>
      </div>
    </div>
  );
}
