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

interface InvoiceNewMetaFieldsProps {
  formCustomer: string;
  onCustomerChange: (val: string) => void;
  customerOptions: OptionItem[];
  formSalesOrder: string;
  onSalesOrderChange: (val: string) => void;
  salesOrderOptions: OptionItem[];
  formInvoiceDate: string;
  onInvoiceDateChange: (val: string) => void;
  formDueDate: string;
  onDueDateChange: (val: string) => void;
  formNotes: string;
  onNotesChange: (val: string) => void;
}

export function InvoiceNewMetaFields({
  formCustomer,
  onCustomerChange,
  customerOptions,
  formSalesOrder,
  onSalesOrderChange,
  salesOrderOptions,
  formInvoiceDate,
  onInvoiceDateChange,
  formDueDate,
  onDueDateChange,
  formNotes,
  onNotesChange,
}: InvoiceNewMetaFieldsProps) {
  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
        General Invoice Information
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Selection */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Customer <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={customerOptions}
            value={formCustomer}
            onChange={onCustomerChange}
            placeholder="Select a customer..."
            emptyMessage="No customer found"
          />
        </div>

        {/* Linked Sales Order */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Linked Sales Order
          </label>
          <SearchableSelect
            options={salesOrderOptions}
            value={formSalesOrder}
            onChange={onSalesOrderChange}
            placeholder="Select sales order (optional)..."
            emptyMessage="No matching sales orders"
          />
        </div>

        {/* Invoice Date */}
        <FormInput
          label="Invoice Issue Date"
          type="date"
          required
          value={formInvoiceDate}
          onChange={(e) => onInvoiceDateChange(e.target.value)}
        />

        {/* Payment Due Date */}
        <FormInput
          label="Payment Due Date"
          type="date"
          required
          value={formDueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>

      {/* Internal / Client Notes */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Notes & Payment Instructions
        </label>
        <textarea
          rows={2}
          value={formNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add terms, bank details, or delivery notes for customer..."
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>
    </Card>
  );
}
