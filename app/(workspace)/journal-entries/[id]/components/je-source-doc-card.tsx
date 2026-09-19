import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FileText, ArrowUpRight, BookOpen } from "lucide-react";
import type { SerializedJournalEntryDetail } from "../types";

export function JeSourceDocCard({ entry }: { entry: SerializedJournalEntryDetail }) {
  let docTitle = "Manual Journal Entry";
  let docUrl: string | null = null;
  let docRef = entry.reference || "Standard adjustment";
  let partyName: string | null = null;

  if (entry.vendorBill) {
    docTitle = "Vendor Bill";
    docUrl = `/bills/${entry.vendorBill.id}`;
    docRef = entry.vendorBill.billNumber;
    partyName = entry.vendorBill.vendor?.name || null;
  } else if (entry.invoice) {
    docTitle = "Customer Invoice";
    docUrl = `/invoices/${entry.invoice.id}`;
    docRef = entry.invoice.invoiceNumber;
    partyName = entry.invoice.customer?.name || null;
  } else if (entry.billPayment) {
    docTitle = "Vendor Bill Payment";
    docUrl = `/payments/${entry.billPayment.id}`;
    docRef = entry.billPayment.vendorBill?.billNumber
      ? `Payment for ${entry.billPayment.vendorBill.billNumber}`
      : "Bill Disbursement";
  } else if (entry.invoicePayment) {
    docTitle = "Customer Invoice Payment";
    docUrl = `/payments/${entry.invoicePayment.id}`;
    docRef = entry.invoicePayment.invoice?.invoiceNumber
      ? `Receipt for ${entry.invoicePayment.invoice.invoiceNumber}`
      : "Invoice Settlement";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-navy" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Source Origin Document
            </h3>
          </div>
          {docUrl && (
            <Link
              href={docUrl}
              className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
            >
              Open Record <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Document Type:</span>
            <span className="font-semibold text-foreground">{docTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference:</span>
            <span className="font-mono font-medium text-navy">{docRef}</span>
          </div>
          {partyName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Associated Party:</span>
              <span className="font-medium text-foreground">{partyName}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <BookOpen className="h-4 w-4 text-navy" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Audit & Posting Metadata
          </h3>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created By:</span>
            <span className="font-medium text-foreground">
              {entry.createdBy?.name || entry.createdBy?.email || "System"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Journal Book:</span>
            <span className="font-medium text-foreground">
              {entry.journal.name} ({entry.journal.code})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posting Status:</span>
            <span className="font-semibold text-navy">{entry.status}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
