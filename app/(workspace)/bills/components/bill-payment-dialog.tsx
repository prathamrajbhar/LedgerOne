"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethod } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { recordPaymentAction } from "@/app/actions/payment.actions";
import type { VendorBillWithRelations } from "../bills-types";

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBill: VendorBillWithRelations | null;
  onSuccess: () => void;
}

export function BillPaymentDialog({
  open,
  onOpenChange,
  selectedBill,
  onSuccess,
}: BillPaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  React.useEffect(() => {
    if (selectedBill) {
      setPaymentAmount(String(selectedBill.amountDue || ""));
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentNote("");
      setPaymentMethod(PaymentMethod.BANK);
    }
  }, [selectedBill]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    const amountNumber = parseFloat(paymentAmount);
    const dueNumber = Number(selectedBill.amountDue);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    if (amountNumber > dueNumber) {
      toast.error("Payment amount cannot exceed balance due to vendor");
      return;
    }

    setRecordingPayment(true);
    try {
      const result = await recordPaymentAction({
        documentId: selectedBill.id,
        documentType: "BILL",
        amount: amountNumber,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (result.success) {
        toast.success("Vendor payment recorded successfully & journal entry created");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording vendor payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-navy">
            Record Vendor Payment
          </DialogTitle>
        </DialogHeader>
        {selectedBill && (
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill:</span>
                <span className="font-mono font-bold text-navy">
                  {selectedBill.billNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-semibold">{selectedBill.vendor?.name}</span>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
                <span className="text-muted-foreground font-medium">Balance Due:</span>
                <span className="font-bold text-amber-600">
                  ₹
                  {Number(selectedBill.amountDue).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <FormInput
              label="Payment Amount (₹)"
              type="number"
              required
              min="0.01"
              step="0.01"
              max={Number(selectedBill.amountDue)}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              helperText="Enter the exact amount paid to the vendor"
            />

            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
              options={[
                { value: PaymentMethod.BANK, label: "Bank Transfer / RTGS / NEFT" },
                { value: PaymentMethod.CASH, label: "Cash Disbursal" },
              ]}
            />

            <FormInput
              label="Payment Date"
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <FormInput
              label="Note / UTR Reference (Optional)"
              type="text"
              placeholder="Bank UTR #, Cheque #, or disbursement reference"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={recordingPayment}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
                disabled={recordingPayment}
              >
                {recordingPayment ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Recording Payment...
                  </>
                ) : (
                  "Confirm Disbursal"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
