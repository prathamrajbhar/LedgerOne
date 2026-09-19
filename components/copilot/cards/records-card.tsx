"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface RecordsCardProps {
  category: string;
  totalCount: number;
  records: Array<{
    id: string;
    billNumber?: string;
    invoiceNumber?: string;
    vendor?: string;
    customer?: string;
    name?: string;
    total?: number;
    amountDue?: number;
    status?: string;
    stock?: number;
    salesPrice?: number;
    email?: string;
    type?: string;
  }>;
}

export function RecordsCard({ data }: { data: RecordsCardProps }) {
  const router = useRouter();
  const { category, totalCount, records } = data;

  const getRoute = (rec: RecordsCardProps["records"][0]) => {
    if (category === "BILLS") return `/bills/${rec.billNumber || rec.id}`;
    if (category === "INVOICES") return `/invoices/${rec.invoiceNumber || rec.id}`;
    if (category === "PRODUCTS") return `/products`;
    if (category === "CONTACTS") return `/contacts`;
    return "/dashboard";
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <span className="font-bold text-navy dark:text-slate-100 flex items-center gap-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-teal" />
          {category} Records
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {totalCount} Total
        </Badge>
      </div>

      {records.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic">No matching records found.</p>
      ) : (
        <div className="space-y-1">
          {records.map((rec) => {
            const label = rec.billNumber || rec.invoiceNumber || rec.name || "Record";
            const sub = rec.vendor || rec.customer || rec.email || "";

            return (
              <div
                key={rec.id}
                onClick={() => router.push(getRoute(rec))}
                className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-[11px] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate mr-2">
                  {category === "PRODUCTS" ? (
                    <Package className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : category === "CONTACTS" ? (
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    <FileText className="w-3 h-3 text-teal shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">{label}</span>
                    {sub && <span className="text-slate-400 block text-[10px] truncate">{sub}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {rec.total !== undefined && (
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                      ₹{rec.total.toLocaleString("en-IN")}
                    </span>
                  )}
                  {rec.stock !== undefined && (
                    <Badge variant={rec.stock === 0 ? "destructive" : "outline"} className="text-[9px]">
                      {rec.stock} in stock
                    </Badge>
                  )}
                  {rec.status && (
                    <span className="text-[9px] text-slate-400 block">{rec.status}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
