"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { PaymentMethod } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface InvoicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  amountDue: number;
  amount: string;
  onAmountChange: (val: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (val: PaymentMethod) => void;
  paymentDate: string;
  onPaymentDateChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  recordingPayment: boolean;
  onSubmit: () => void;
}

export function InvoicePaymentModal({
  open,
  onOpenChange,
  invoiceNumber,
  amountDue,
  amount,
  onAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentDate,
  onPaymentDateChange,
  note,
  onNoteChange,
  recordingPayment,
  onSubmit,
}: InvoicePaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-navy">
            Record Customer Receipt
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invoice #{invoiceNumber} • Remaining balance: ₹
            {amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <FormInput
            label="Payment Amount (₹)"
            type="number"
            min="0.01"
            max={amountDue}
            step="0.01"
            required
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={`Max: ${amountDue}`}
          />

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Payment Method <span className="text-destructive">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value={PaymentMethod.BANK}>Bank Transfer</option>
              <option value={PaymentMethod.CASH}>Cash</option>
            </select>
          </div>

          <FormInput
            label="Payment Date"
            type="date"
            required
            value={paymentDate}
            onChange={(e) => onPaymentDateChange(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Reference / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="e.g., NEFT ref or cash receipt note"
              className="w-full h-9 rounded-lg border border-border bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={recordingPayment}
            className="h-8 text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={recordingPayment}
            className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-medium cursor-pointer"
          >
            {recordingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Confirm Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
