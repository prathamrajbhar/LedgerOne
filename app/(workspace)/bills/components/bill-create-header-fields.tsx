"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface BillCreateHeaderFieldsProps {
  formVendor: string;
  setFormVendor: (val: string) => void;
  formPurchaseOrder: string;
  setFormPurchaseOrder: (val: string) => void;
  formVendorBillNumber: string;
  setFormVendorBillNumber: (val: string) => void;
  formBillDate: string;
  setFormBillDate: (val: string) => void;
  formDueDate: string;
  setFormDueDate: (val: string) => void;
  formPaymentTerms: string;
  setFormPaymentTerms: (val: string) => void;
  vendorOptions: Array<{ value: string; label: string; subLabel?: string }>;
  purchaseOrderOptions: Array<{ value: string; label: string }>;
  purchaseOrders: Array<{ id: string; poNumber: string; vendorId: string }>;
}

export function BillCreateHeaderFields({
  formVendor,
  setFormVendor,
  formPurchaseOrder,
  setFormPurchaseOrder,
  formVendorBillNumber,
  setFormVendorBillNumber,
  formBillDate,
  setFormBillDate,
  formDueDate,
  setFormDueDate,
  formPaymentTerms,
  setFormPaymentTerms,
  vendorOptions,
  purchaseOrderOptions,
  purchaseOrders,
}: BillCreateHeaderFieldsProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-border/80 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-xs font-bold text-navy">
        <Building2 className="h-4 w-4 text-teal" />
        <span>Vendor & Procurement Reference</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Vendor / Supplier <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={vendorOptions}
            value={formVendor}
            onChange={(val) => {
              setFormVendor(val);
              if (formPurchaseOrder) {
                const linkedPo = purchaseOrders.find((po) => po.poNumber === formPurchaseOrder);
                if (linkedPo && linkedPo.vendorId !== val) setFormPurchaseOrder("");
              }
            }}
            placeholder="Select Vendor..."
            searchPlaceholder="Search vendor by name, email..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Purchase Order (PO Link)
          </label>
          <SearchableSelect
            options={purchaseOrderOptions}
            value={formPurchaseOrder}
            onChange={(val) => setFormPurchaseOrder(val)}
            placeholder="Direct Bill (No PO)"
            searchPlaceholder="Search purchase order..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Supplier Invoice / Bill #
          </label>
          <input
            type="text"
            placeholder="e.g. VEND-INV-9821"
            value={formVendorBillNumber}
            onChange={(e) => setFormVendorBillNumber(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal focus:border-teal placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Bill Date <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={formBillDate}
            onChange={(e) => setFormBillDate(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal focus:border-teal transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Payment Due Date <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={formDueDate}
            onChange={(e) => setFormDueDate(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal focus:border-teal transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">Payment Terms</label>
          <select
            value={formPaymentTerms}
            onChange={(e) => {
              setFormPaymentTerms(e.target.value);
              const days = e.target.value === "NET_15" ? 15 : e.target.value === "NET_60" ? 60 : 30;
              const d = new Date(formBillDate);
              d.setDate(d.getDate() + days);
              setFormDueDate(d.toISOString().split("T")[0]);
            }}
            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-teal focus:border-teal transition-all"
          >
            <option value="NET_15">Net 15 Days</option>
            <option value="NET_30">Net 30 Days (Standard)</option>
            <option value="NET_60">Net 60 Days</option>
            <option value="IMMEDIATE">Immediate / Due on Receipt</option>
          </select>
        </div>
      </div>
    </div>
  );
}
