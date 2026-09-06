"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  getUnpaidInvoicesAction,
  getUnpaidBillsAction,
  recordPaymentAction,
  UnpaidDocument,
} from "@/app/actions/payment.actions";
import { PaymentMethod } from "@prisma/client";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultDirection?: "INBOUND" | "OUTBOUND";
}

export function PaymentModal({
  open,
  onOpenChange,
  onSuccess,
  defaultDirection = "INBOUND",
}: PaymentModalProps) {
  const [direction, setDirection] = React.useState<"INBOUND" | "OUTBOUND">(defaultDirection);
  const [unpaidDocuments, setUnpaidDocuments] = React.useState<UnpaidDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setDirection(defaultDirection);
  }, [defaultDirection, open]);

  const loadUnpaidDocuments = React.useCallback(async () => {
    if (direction === "INBOUND") {
      const result = await getUnpaidInvoicesAction();
      if (result.success && result.data) {
        setUnpaidDocuments(result.data);
      } else {
        toast.error(result.error || "Failed to load unpaid invoices");
      }
    } else {
      const result = await getUnpaidBillsAction();
      if (result.success && result.data) {
        setUnpaidDocuments(result.data);
      } else {
        toast.error(result.error || "Failed to load unpaid bills");
      }
    }
  }, [direction]);

  React.useEffect(() => {
    if (open) {
      loadUnpaidDocuments();
    }
  }, [open, loadUnpaidDocuments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !amount) {
      toast.error("Please select a document and enter amount");
      return;
    }

    const selectedDoc = unpaidDocuments.find((d) => d.id === selectedDocument);
    if (!selectedDoc) {
      toast.error("Please select a valid document");
      return;
    }

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (paymentAmount > selectedDoc.amountDue) {
      toast.error("Payment amount cannot exceed amount due");
      return;
    }

    setSubmitting(true);
    const result = await recordPaymentAction({
      documentId: selectedDocument,
      documentType: direction === "INBOUND" ? "INVOICE" : "BILL",
      amount: paymentAmount,
      paymentMethod,
      paymentDate: new Date(),
      note,
    });

    if (result.success) {
      toast.success("Payment recorded successfully and journal entry created");
      onOpenChange(false);
      setSelectedDocument("");
      setAmount("");
      setNote("");
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to record payment");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
          <FormSelect
            label="Payment Type"
            value={direction}
            onValueChange={(val) => {
              setDirection(val as "INBOUND" | "OUTBOUND");
              setSelectedDocument("");
              setAmount("");
            }}
            options={[
              { value: "INBOUND", label: "Customer Receipt (Money In)" },
              { value: "OUTBOUND", label: "Vendor Payment (Money Out)" },
            ]}
          />
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-semibold text-foreground">
              {direction === "INBOUND" ? "Select Invoice" : "Select Bill"}
              <span className="text-destructive ml-1">*</span>
            </label>
            <SearchableSelect
              options={unpaidDocuments.map((doc) => ({
                value: doc.id,
                label: `${doc.number} • ${doc.party}`,
                subLabel: `Due: ₹${doc.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              }))}
              value={selectedDocument}
              onChange={setSelectedDocument}
              placeholder={unpaidDocuments.length === 0 ? "No unpaid documents" : "Select document..."}
              searchPlaceholder={
                direction === "INBOUND"
                  ? "Search invoice # or customer..."
                  : "Search bill # or vendor..."
              }
              emptyMessage="No unpaid documents found"
              className="h-10"
            />
          </div>
          {selectedDocument && (
            <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">
                  ₹{unpaidDocuments.find((d) => d.id === selectedDocument)?.total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-semibold text-success">
                  ₹{unpaidDocuments.find((d) => d.id === selectedDocument)?.amountPaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-muted-foreground">Amount Due:</span>
                <span className="font-bold text-destructive">
                  ₹{unpaidDocuments.find((d) => d.id === selectedDocument)?.amountDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
          <FormInput
            label="Payment Amount (₹)"
            type="number"
            required
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
          />
          <FormSelect
            label="Payment Method"
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            options={[
              { value: PaymentMethod.BANK, label: "Bank Transfer" },
              { value: PaymentMethod.CASH, label: "Cash Payment" },
            ]}
          />
          <FormInput
            label="Note (Optional)"
            placeholder="Payment reference or notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9 px-4 text-xs rounded-lg font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 text-xs rounded-lg bg-navy hover:bg-navy/90 text-white font-semibold shadow-xs"
              disabled={submitting || !selectedDocument || !amount}
            >
              {submitting ? "Recording..." : "Post Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
