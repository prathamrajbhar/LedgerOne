"use client";

import * as React from "react";
import {
  FileText,
  Receipt,
  CreditCard,
  UserPlus,
  Building2,
  PackagePlus,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export type DashboardModalType =
  | "invoice"
  | "expense"
  | "payment"
  | "customer"
  | "supplier"
  | "product"
  | null;

interface QuickActionsCardProps {
  onSelectAction: (action: DashboardModalType) => void;
}

export function QuickActionsCard({ onSelectAction }: QuickActionsCardProps) {
  return (
    <Card className="p-5 bg-white shadow-card">
      <CardTitle className="text-sm font-bold text-foreground mb-4">
        Quick Actions
      </CardTitle>
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectAction("invoice")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Create Invoice
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAction("expense")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
            <Receipt className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Record Expense
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAction("payment")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F5F5] text-teal group-hover:bg-navy group-hover:text-white transition-colors mb-2">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Add Payment
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAction("customer")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:bg-navy group-hover:text-white transition-colors mb-2">
            <UserPlus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Add Customer
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAction("supplier")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-navy hover:bg-[#E8F0F7]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0F7] text-navy group-hover:bg-navy group-hover:text-white transition-colors mb-2">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Add Supplier
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAction("product")}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-teal hover:bg-[#E7F5F5]/40 transition-all text-center group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:bg-teal group-hover:text-white transition-colors mb-2">
            <PackagePlus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-tight">
            Add Product
          </span>
        </button>
      </div>
    </Card>
  );
}
