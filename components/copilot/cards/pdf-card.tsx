"use client";

import * as React from "react";
import { FileText, Download, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface PdfCardData {
  found: boolean;
  message?: string;
  documentType?: "INVOICE" | "BILL";
  documentId?: string;
  documentNumber?: string;
  downloadUrl?: string;
  partyName?: string;
  total?: number;
  amountDue?: number;
  status?: string;
  paymentStatus?: string;
  issueDate?: string;
}

interface PdfCardProps {
  data: PdfCardData;
}

export function PdfCard({ data }: PdfCardProps) {
  if (!data.found) {
    return (
      <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">PDF Unavailable</span>
          <span>{data.message || "The requested document could not be found."}</span>
        </div>
      </div>
    );
  }

  const isInvoice = data.documentType === "INVOICE";
  const viewUrl = isInvoice ? `/invoices/${data.documentId || data.documentNumber}` : `/bills/${data.documentId || data.documentNumber}`;

  return (
    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {isInvoice ? "Customer Invoice" : "Vendor Bill"} PDF
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{data.documentNumber}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
          {data.status || "CONFIRMED"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-slate-500 text-[10px] block">{isInvoice ? "Customer" : "Vendor"}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">{data.partyName || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Total Amount</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
            ₹{Number(data.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Date</span>
          <span className="text-slate-600 dark:text-slate-300 text-[10px] block">{data.issueDate || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Payment Status</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 inline" />
            {data.paymentStatus || "UNPAID"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <Button
          asChild
          size="sm"
          className="flex-1 bg-navy hover:bg-slate-800 text-white text-xs h-7.5 gap-1.5 font-medium shadow-xs"
        >
          <a href={data.downloadUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="text-xs h-7.5 gap-1 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Link href={viewUrl}>
            <ExternalLink className="w-3 h-3" />
            View
          </Link>
        </Button>
      </div>
    </div>
  );
}
