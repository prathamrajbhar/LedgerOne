"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PaymentMethod } from "@prisma/client";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { UnpaidDocument } from "@/app/actions/payment.actions";

interface PaymentNewFieldsProps {
  direction: "INBOUND" | "OUTBOUND";
  onDirectionChange: (dir: "INBOUND" | "OUTBOUND") => void;
  unpaidDocuments: UnpaidDocument[];
  selectedDocumentId: string;
  onSelectedDocumentIdChange: (id: string) => void;
  amount: string;
  onAmountChange: (val: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (val: PaymentMethod) => void;
  note: string;
  onNoteChange: (val: string) => void;
}

export function PaymentNewFields({
  direction,
  onDirectionChange,
  unpaidDocuments,
  selectedDocumentId,
  onSelectedDocumentIdChange,
  amount,
  onAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  note,
  onNoteChange,
}: PaymentNewFieldsProps) {
  const documentOptions = React.useMemo(() => {
    return unpaidDocuments.map((doc) => ({
      value: doc.id,
      label: `${doc.number} - ${doc.party}`,
      subLabel: `Due: ₹${doc.amountDue.toLocaleString("en-IN")} • Expires: ${doc.dueDate}`,
    }));
  }, [unpaidDocuments]);

  const selectedDoc = unpaidDocuments.find((d) => d.id === selectedDocumentId);

  return (
    <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-5">
      {/* Direction Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-navy uppercase tracking-wider block">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onDirectionChange("INBOUND")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              direction === "INBOUND"
                ? "border-teal bg-teal/5 text-teal shadow-2xs"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            Customer Receipt (Inbound)
          </button>

          <button
            type="button"
            onClick={() => onDirectionChange("OUTBOUND")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              direction === "OUTBOUND"
                ? "border-navy bg-navy/5 text-navy shadow-2xs"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-navy" />
            Vendor Payout (Outbound)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Selection */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Select {direction === "INBOUND" ? "Customer Invoice" : "Vendor Bill"}{" "}
            <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={documentOptions}
            value={selectedDocumentId}
            onChange={(val) => {
              onSelectedDocumentIdChange(val);
              const doc = unpaidDocuments.find((d) => d.id === val);
              if (doc) onAmountChange(String(doc.amountDue));
            }}
            placeholder={`Choose ${direction === "INBOUND" ? "invoice" : "bill"} with outstanding balance...`}
            emptyMessage="No pending unpaid documents found"
          />
        </div>

        {/* Payment Amount */}
        <div>
          <FormInput
            label={`Payment Amount (₹)${
              selectedDoc ? ` — Max: ₹${selectedDoc.amountDue.toLocaleString("en-IN")}` : ""
            }`}
            type="number"
            step="0.01"
            min="0.01"
            max={selectedDoc?.amountDue}
            required
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Payment Method <span className="text-destructive">*</span>
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value={PaymentMethod.BANK}>Bank Transfer / NEFT / Cheque</option>
            <option value={PaymentMethod.CASH}>Cash Drawer Ledger</option>
          </select>
        </div>

        {/* Note / Reference */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Reference / Memo
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="e.g., UTR number, cheque #, or cash receipt tag"
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>
    </Card>
  );
}
