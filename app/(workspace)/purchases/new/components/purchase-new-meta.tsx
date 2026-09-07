"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormInput } from "@/components/forms/form-input";

interface OptionItem {
  value: string;
  label: string;
  subLabel?: string;
}

interface PurchaseNewMetaProps {
  vendorId: string;
  onVendorChange: (val: string) => void;
  vendorOptions: OptionItem[];
  orderDate: string;
  onOrderDateChange: (val: string) => void;
}

export function PurchaseNewMeta({
  vendorId,
  onVendorChange,
  vendorOptions,
  orderDate,
  onOrderDateChange,
}: PurchaseNewMetaProps) {
  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
        Vendor & Procurement Specifics
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Vendor / Supplier <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={vendorOptions}
            value={vendorId}
            onChange={onVendorChange}
            placeholder="Select a supplier..."
            emptyMessage="No supplier found"
          />
        </div>

        <FormInput
          label="Order Date"
          type="date"
          required
          value={orderDate}
          onChange={(e) => onOrderDateChange(e.target.value)}
        />
      </div>
    </Card>
  );
}
