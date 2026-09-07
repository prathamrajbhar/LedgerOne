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

interface SalesNewMetaProps {
  customerId: string;
  onCustomerChange: (val: string) => void;
  customerOptions: OptionItem[];
  orderDate: string;
  onOrderDateChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

export function SalesNewMeta({
  customerId,
  onCustomerChange,
  customerOptions,
  orderDate,
  onOrderDateChange,
  notes,
  onNotesChange,
}: SalesNewMetaProps) {
  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
        Customer & Order Specifics
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Customer <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={customerOptions}
            value={customerId}
            onChange={onCustomerChange}
            placeholder="Select a customer..."
            emptyMessage="No customer found"
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

      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Order Notes / Specifications
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Delivery terms, customization notes, or client instructions..."
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>
    </Card>
  );
}
