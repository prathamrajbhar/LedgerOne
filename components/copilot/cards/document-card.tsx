"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface DocumentDetails {
  documentType: string;
  id: string;
  documentNumber: string;
  contactName?: string;
  contactEmail?: string;
  status: string;
  paymentStatus?: string;
  date: string;
  dueDate?: string;
  subtotal?: number;
  taxAmount?: number;
  total: number;
  amountPaid?: number;
  amountDue?: number;
  lines: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export function DocumentCard({ data }: { data: { found: boolean; details?: DocumentDetails; message?: string } }) {
  const router = useRouter();

  if (!data.found || !data.details) {
    return (
      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 italic">
        {data.message || "Document not found."}
      </div>
    );
  }

  const doc = data.details;
  const route = doc.documentType === "CUSTOMER_INVOICE" ? `/invoices/${doc.documentNumber}` : `/bills/${doc.documentNumber}`;

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-teal" />
          <span className="font-bold text-xs text-navy dark:text-white">{doc.documentNumber}</span>
        </div>
        <Badge variant={doc.status === "CONFIRMED" ? "default" : "outline"} className="text-[10px]">
          {doc.status} {doc.paymentStatus ? `(${doc.paymentStatus})` : ""}
        </Badge>
      </div>

      <div className="text-[11px] text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
        <div>
          <span className="text-slate-400 block text-[10px]">Party</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{doc.contactName || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Due Date</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{doc.dueDate || doc.date}</span>
        </div>
      </div>

      {/* Lines Table */}
      {doc.lines && doc.lines.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Line Items</span>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
            {doc.lines.map((line, idx) => (
              <div key={idx} className="py-1 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 truncate mr-2">
                  {line.quantity}x {line.productName}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 shrink-0">
                  ₹{line.lineTotal.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Strip */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800 dark:text-white">Total Amount</span>
        <span className="font-bold text-emerald-600">₹{doc.total.toLocaleString("en-IN")}</span>
      </div>

      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => router.push(route)}
        className="w-full text-xs h-7 gap-1 font-medium cursor-pointer"
      >
        <span>Open {doc.documentNumber}</span>
        <ArrowRight className="w-3 h-3" />
      </Button>
    </div>
  );
}
