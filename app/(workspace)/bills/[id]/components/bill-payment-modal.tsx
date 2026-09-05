"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { PaymentMethod } from "@prisma/client";
import { SerializedBillData } from "../types";

interface BillPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: SerializedBillData;
  paymentAmount: string;
  setPaymentAmount: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  paymentDate: string;
  setPaymentDate: (val: string) => void;
  paymentNote: string;
  setPaymentNote: (val: string) => void;
  recordingPayment: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function BillPaymentModal({
  open,
  onOpenChange,
  bill,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  paymentDate,
  setPaymentDate,
  paymentNote,
  setPaymentNote,
  recordingPayment,
  onSubmit,
}: BillPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-navy">
            Record Vendor Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill:</span>
              <span className="font-mono font-bold text-navy">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-semibold">{bill.vendor.name}</span>
            </div>
            <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
              <span className="text-muted-foreground font-medium">Balance Due:</span>
              <span className="font-bold text-amber-600 font-mono">
                ₹{bill.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <FormInput
            label="Payment Amount (₹)"
            type="number"
            min="0.01"
            max={bill.amountDue.toString()}
            step="0.01"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />

          <FormSelect
            label="Payment Method"
            options={[
              { value: PaymentMethod.BANK, label: "Bank Transfer (NEFT/RTGS)" },
              { value: PaymentMethod.CASH, label: "Cash in Hand" },
            ]}
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
          />

          <FormInput
            label="Payment Date"
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          <FormInput
            label="Payment Reference / Note"
            placeholder="e.g. UTR #, Cheque #, Vendor receipt"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={recordingPayment}
              className="bg-teal hover:bg-teal/90 text-white font-semibold"
            >
              {recordingPayment ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Recording...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
