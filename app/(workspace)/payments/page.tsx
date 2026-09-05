"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  getPaymentsAction,
  getUnpaidInvoicesAction,
  getUnpaidBillsAction,
  recordPaymentAction,
  PaymentRecord,
  UnpaidDocument,
} from "@/app/actions/payment.actions";
import { PaymentMethod } from "@prisma/client";

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const [direction, setDirection] = React.useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [unpaidDocuments, setUnpaidDocuments] = React.useState<UnpaidDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [note, setNote] = React.useState("");

  const documentOptions = React.useMemo(() => {
    return unpaidDocuments.map((doc) => ({
      value: doc.id,
      label: `${doc.number} - ${doc.party}`,
      subLabel: `Due: ₹${doc.amountDue.toLocaleString("en-IN")} • Total: ₹${doc.total.toLocaleString("en-IN")}`,
    }));
  }, [unpaidDocuments]);

  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    const result = await getPaymentsAction();
    if (result.success && result.data) {
      setPayments(result.data);
    } else {
      toast.error(result.error || "Failed to load payments");
    }
    setLoading(false);
  }, []);

  // Fetch payments on mount
  React.useEffect(() => {
    loadPayments();
  }, [loadPayments]);

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

  // Fetch unpaid documents when modal opens or direction changes
  React.useEffect(() => {
    if (openModal) {
      loadUnpaidDocuments();
    }
  }, [openModal, loadUnpaidDocuments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !amount) return;

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
      setOpenModal(false);
      setSelectedDocument("");
      setAmount("");
      setNote("");
      loadPayments();
    } else {
      toast.error(result.error || "Failed to record payment");
    }
    setSubmitting(false);
  };

  const filtered = payments.filter((p) =>
    p.party.toLowerCase().includes(search.toLowerCase()) ||
    p.ref.toLowerCase().includes(search.toLowerCase()) ||
    p.documentNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Update amount when document is selected
  React.useEffect(() => {
    if (selectedDocument) {
      const doc = unpaidDocuments.find((d) => d.id === selectedDocument);
      if (doc) {
        setAmount(doc.amountDue.toString());
      }
    }
  }, [selectedDocument, unpaidDocuments]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Banking"
        description="Record customer receipts, vendor disbursements, and view bank account clearing vouchers."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    {direction === "INBOUND" ? "Select Invoice" : "Select Bill"} <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    value={selectedDocument}
                    onChange={setSelectedDocument}
                    options={documentOptions}
                    placeholder={unpaidDocuments.length === 0 ? "No unpaid documents" : "Select document"}
                    searchPlaceholder={`Search by ${direction === "INBOUND" ? "invoice" : "bill"} number or party...`}
                    disabled={unpaidDocuments.length === 0}
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
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Recording..." : "Post Payment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments by ref, party, or document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading payments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {search ? "No payments found matching your search" : "No payments recorded yet"}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Payment #</th>
                <th className="py-3.5 px-4">Party / Counterparty</th>
                <th className="py-3.5 px-4">Document</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{row.ref}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{row.party}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.documentNumber}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.method}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.date}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.account}</td>
                  <td className={`py-3.5 px-4 text-right font-bold ${row.direction === "INBOUND" ? "text-success" : "text-destructive"}`}>
                    {row.direction === "INBOUND" ? "+" : "-"}₹{row.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
