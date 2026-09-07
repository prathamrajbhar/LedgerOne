"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PaymentMethod } from "@prisma/client";
import {
  getUnpaidInvoicesAction,
  getUnpaidBillsAction,
  recordPaymentAction,
  type UnpaidDocument,
} from "@/app/actions/payment.actions";
import { PaymentNewHeader } from "./components/payment-new-header";
import { PaymentNewFields } from "./components/payment-new-fields";

interface PaymentCreateClientProps {
  initialInvoices: UnpaidDocument[];
  initialBills: UnpaidDocument[];
}

export function PaymentCreateClient({
  initialInvoices,
  initialBills,
}: PaymentCreateClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const invoiceIdParam = searchParams.get("invoiceId");
  const billIdParam = searchParams.get("billId");
  const returnUrl = searchParams.get("returnUrl") || "/payments";

  const initialDir =
    billIdParam || searchParams.get("direction") === "OUTBOUND" ? "OUTBOUND" : "INBOUND";
  const initialDocId =
    invoiceIdParam || billIdParam || searchParams.get("documentId") || "";

  const [direction, setDirection] = React.useState<"INBOUND" | "OUTBOUND">(initialDir);
  const [unpaidDocuments, setUnpaidDocuments] = React.useState<UnpaidDocument[]>(
    initialDir === "INBOUND" ? initialInvoices : initialBills
  );
  const [selectedDocumentId, setSelectedDocumentId] = React.useState(initialDocId);
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Pre-fill amount when document is selected
  React.useEffect(() => {
    if (selectedDocumentId) {
      const doc = unpaidDocuments.find((d) => d.id === selectedDocumentId);
      if (doc) {
        setAmount(doc.amountDue.toString());
      }
    }
  }, [selectedDocumentId, unpaidDocuments]);

  const handleDirectionChange = async (newDir: "INBOUND" | "OUTBOUND") => {
    setDirection(newDir);
    setSelectedDocumentId("");
    setAmount("");

    if (newDir === "INBOUND") {
      const res = await getUnpaidInvoicesAction();
      if (res.success && res.data) setUnpaidDocuments(res.data);
    } else {
      const res = await getUnpaidBillsAction();
      if (res.success && res.data) setUnpaidDocuments(res.data);
    }
  };

  const handleDocumentSelect = (id: string) => {
    setSelectedDocumentId(id);
    const doc = unpaidDocuments.find((d) => d.id === id);
    if (doc) {
      setAmount(doc.amountDue.toString());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentId || !amount) {
      toast.error("Please select a document and enter an amount");
      return;
    }

    const doc = unpaidDocuments.find((d) => d.id === selectedDocumentId);
    if (!doc) {
      toast.error("Please select a valid document");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (numAmount > doc.amountDue) {
      toast.error(`Amount cannot exceed the balance due of ₹${doc.amountDue.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await recordPaymentAction({
        documentId: selectedDocumentId,
        documentType: direction === "INBOUND" ? "INVOICE" : "BILL",
        amount: numAmount,
        paymentMethod,
        paymentDate: new Date(),
        note: note.trim() || undefined,
      });

      if (result.success) {
        toast.success(
          `${direction === "INBOUND" ? "Customer receipt" : "Vendor payment"} of ₹${numAmount} recorded!`
        );
        router.push(returnUrl);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <PaymentNewHeader
        submitting={submitting}
        onSave={handleSave}
        onCancel={() => router.push(returnUrl)}
      />

      <form onSubmit={handleSave}>
        <PaymentNewFields
          direction={direction}
          onDirectionChange={handleDirectionChange}
          unpaidDocuments={unpaidDocuments}
          selectedDocumentId={selectedDocumentId}
          onSelectedDocumentIdChange={handleDocumentSelect}
          amount={amount}
          onAmountChange={setAmount}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          note={note}
          onNoteChange={setNote}
        />
      </form>
    </div>
  );
}
