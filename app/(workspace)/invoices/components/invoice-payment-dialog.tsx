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
import type { InvoiceWithRelations } from "../invoices-types";

interface InvoicePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvoice: InvoiceWithRelations | null;
  onSuccess: () => void;
}

export function InvoicePaymentDialog({
  open,
  onOpenChange,
  selectedInvoice,
  onSuccess,
}: InvoicePaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  React.useEffect(() => {
    if (selectedInvoice) {
      setPaymentAmount(Number(selectedInvoice.amountDue).toFixed(2));
      setPaymentMethod(PaymentMethod.BANK);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentNote("");
    }
  }, [selectedInvoice]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const amt = parseFloat(paymentAmount);
    const due = Number(selectedInvoice.amountDue);

    if (isNaN(amt) || amt <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    if (amt > due) {
      toast.error("Payment amount cannot exceed balance due");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await recordPaymentAction({
        documentId: selectedInvoice.id,
        documentType: "INVOICE",
        amount: amt,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (res.success) {
        toast.success("Payment recorded successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-navy">
            Record Customer Payment
          </DialogTitle>
        </DialogHeader>
        {selectedInvoice && (
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-mono font-bold text-navy">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-semibold">{selectedInvoice.customer?.name}</span>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
                <span className="text-muted-foreground font-medium">Balance Due:</span>
                <span className="font-bold text-amber-600">
                  ₹{Number(selectedInvoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <FormInput
              label="Payment Amount (₹)"
              type="number"
              required
              min="0.01"
              step="0.01"
              max={Number(selectedInvoice.amountDue)}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              helperText="Enter the amount collected"
            />

            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
              options={[
                { value: PaymentMethod.BANK, label: "Bank Transfer" },
                { value: PaymentMethod.CASH, label: "Cash Receipt" },
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
              label="Note / Reference (Optional)"
              type="text"
              placeholder="Bank UTR, Cheque #, etc."
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
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 cursor-pointer"
                disabled={recordingPayment}
              >
                {recordingPayment ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Confirm Receipt"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
