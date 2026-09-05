"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search, Download, CheckCircle, Loader2, DollarSign } from "lucide-react";
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
import {
  getInvoicesAction,
  createStandaloneInvoiceAction,
  confirmInvoiceAction
} from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { recordPaymentAction } from "@/app/actions/payment.actions";
import { DocumentStatus, PaymentStatus, PaymentMethod, Prisma } from "@prisma/client";
import type { CustomerInvoice, Contact, Product } from "@prisma/client";

interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  lines: Array<{
    id: string;
    quantity: Prisma.Decimal;
    unitPrice: Prisma.Decimal;
    lineTotal: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    product: Product;
  }>;
  payments: Array<{
    id: string;
    amount: Prisma.Decimal;
  }>;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<InvoiceWithRelations[]>([]);
  const [customers, setCustomers] = React.useState<Contact[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [openModal, setOpenModal] = React.useState(false);
  const [confirmingInvoiceId, setConfirmingInvoiceId] = React.useState<string | null>(null);

  // Payment recording state
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = React.useState<InvoiceWithRelations | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  // Form state
  const [customerId, setCustomerId] = React.useState("");
  const [invoiceDate, setInvoiceDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [productId, setProductId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Fetch invoices, customers, and products on mount
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesResult, customersResult, productsResult] = await Promise.all([
        getInvoicesAction({ limit: 100 }),
        getContactsAction({ type: "CUSTOMER", limit: 100 }),
        getProductsAction({ limit: 100 }),
      ]);

      if (invoicesResult.success && invoicesResult.data) {
        setInvoices(invoicesResult.data.data as InvoiceWithRelations[]);
      } else {
        toast.error(invoicesResult.error || "Failed to fetch invoices");
      }

      if (customersResult.success && customersResult.data) {
        const contactData = customersResult.data as { contacts?: Contact[] };
        const customerList = contactData.contacts || [];
        setCustomers(customerList);
        if (customerList.length > 0) {
          setCustomerId(customerList[0].id);
        }
      }

      if (productsResult.success && productsResult.data) {
        const prodData = productsResult.data as { data?: Product[] };
        const productList = prodData.data || [];
        setProducts(productList);
        if (productList.length > 0) {
          setProductId(productList[0].id);
          setUnitPrice(String(productList[0].salesPrice));
        }
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !productId || !quantity || !unitPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const result = await createStandaloneInvoiceAction({
        customerId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        lines: [
          {
            productId,
            description: products.find((p) => p.id === productId)?.name || "Product",
            quantity: parseFloat(quantity),
            unitPrice: parseFloat(unitPrice),
          },
        ],
      });

      if (result.success && result.data) {
        toast.success(`Invoice ${result.data.invoiceNumber} created successfully`);
        setOpenModal(false);
        fetchData();
        // Reset form
        setQuantity("1");
        setUnitPrice(products.find((p) => p.id === productId)?.salesPrice.toString() || "");
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("An error occurred while creating invoice");
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmInvoice = async (invoiceId: string) => {
    setConfirmingInvoiceId(invoiceId);
    try {
      const result = await confirmInvoiceAction(invoiceId);

      if (result.success) {
        toast.success("Invoice confirmed and journal entry generated");
        fetchData();
      } else {
        toast.error(result.error || "Failed to confirm invoice");
      }
    } catch (error) {
      toast.error("An error occurred while confirming invoice");
      console.error(error);
    } finally {
      setConfirmingInvoiceId(null);
    }
  };

  const handleOpenPaymentModal = (invoice: InvoiceWithRelations) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentAmount(parseFloat(invoice.amountDue.toString()).toFixed(2));
    setPaymentMethod(PaymentMethod.BANK);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNote("");
    setOpenPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoiceForPayment || !paymentAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const amountDue = parseFloat(selectedInvoiceForPayment.amountDue.toString());

    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (amount > amountDue) {
      toast.error("Payment amount cannot exceed amount due");
      return;
    }

    setRecordingPayment(true);
    try {
      const result = await recordPaymentAction({
        documentId: selectedInvoiceForPayment.id,
        documentType: "INVOICE",
        amount,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (result.success) {
        toast.success("Payment recorded successfully and journal entry generated");
        setOpenPaymentModal(false);
        fetchData();
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    } catch (error) {
      toast.error("An error occurred while recording payment");
      console.error(error);
    } finally {
      setRecordingPayment(false);
    }
  };

  const getDisplayStatus = (invoice: InvoiceWithRelations): string => {
    if (invoice.status === DocumentStatus.DRAFT) return "DRAFT";
    if (invoice.status === DocumentStatus.CANCELLED) return "CANCELLED";

    // For confirmed invoices, show payment status
    if (invoice.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (invoice.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";

    // Check if overdue
    const today = new Date();
    const due = new Date(invoice.dueDate);
    if (due < today && invoice.paymentStatus === PaymentStatus.NOT_PAID) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase());
    const displayStatus = getDisplayStatus(inv);
    const matchesStatus = statusFilter === "ALL" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Invoices"
        description="Issue professional GST sales invoices for furniture deliveries and track customer receivables."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Customer Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
                <FormSelect
                  label="Select Customer"
                  value={customerId}
                  onValueChange={setCustomerId}
                  options={customers.map((c) => ({ value: c.id, label: c.name }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Invoice Date"
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                  <FormInput
                    label="Due Date"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <FormSelect
                  label="Select Product"
                  value={productId}
                  onValueChange={(val) => {
                    setProductId(val);
                    const product = products.find((p) => p.id === val);
                    if (product) {
                      setUnitPrice(product.salesPrice.toString());
                    }
                  }}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Quantity"
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <FormInput
                    label="Unit Price (₹)"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        Creating...
                      </>
                    ) : (
                      "Create Invoice"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Payment Recording Modal */}
      <Dialog open={openPaymentModal} onOpenChange={setOpenPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoiceForPayment && (
            <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
              <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-mono font-bold text-navy">
                    {selectedInvoiceForPayment.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold">{selectedInvoiceForPayment.customer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">
                    ₹{parseFloat(selectedInvoiceForPayment.total.toString()).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span>
                    ₹{parseFloat(selectedInvoiceForPayment.amountPaid.toString()).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1.5 mt-1.5">
                  <span className="text-muted-foreground">Amount Due:</span>
                  <span className="text-red-600">
                    ₹{parseFloat(selectedInvoiceForPayment.amountDue.toString()).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <FormInput
                label="Payment Amount (₹)"
                type="number"
                required
                min="0.01"
                step="0.01"
                max={parseFloat(selectedInvoiceForPayment.amountDue.toString())}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                helperText="Enter the amount received from the customer"
              />

              <FormSelect
                label="Payment Method"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                options={[
                  { value: PaymentMethod.BANK, label: "Bank Transfer" },
                  { value: PaymentMethod.CASH, label: "Cash" },
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
                label="Note (Optional)"
                type="text"
                placeholder="Add payment reference or notes"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpenPaymentModal(false)}
                  disabled={recordingPayment}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy hover:bg-navy-hover text-white"
                  disabled={recordingPayment}
                >
                  {recordingPayment ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or customer name..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
          {["ALL", "DRAFT", "PENDING", "PAID", "PARTIAL", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === s
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All Invoices" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {search || statusFilter !== "ALL" ? "No invoices found matching your filters." : "No invoices yet. Create your first invoice to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Amount Due</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  const displayStatus = getDisplayStatus(inv);
                  const isOverdue = displayStatus === "OVERDUE";
                  const isDraft = inv.status === DocumentStatus.DRAFT;

                  return (
                    <tr key={inv.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {inv.customer.name}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`py-3.5 px-4 ${isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                        {new Date(inv.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground">
                        ₹{parseFloat(inv.amountPaid.toString()).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                        ₹{parseFloat(inv.amountDue.toString()).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground">
                        ₹{parseFloat(inv.total.toString()).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isDraft && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfirmInvoice(inv.id)}
                              disabled={confirmingInvoiceId === inv.id}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Confirm Invoice"
                            >
                              {confirmingInvoiceId === inv.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          {!isDraft && parseFloat(inv.amountDue.toString()) > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Record Payment"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/invoices/${inv.id}/download`);
                                if (!response.ok) {
                                  toast.error("Failed to download invoice");
                                  return;
                                }
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `Invoice-${inv.invoiceNumber}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                toast.success("Invoice downloaded successfully");
                              } catch (error) {
                                toast.error("Error downloading invoice");
                                console.error(error);
                              }
                            }}
                            className="h-7 px-2 text-muted-foreground hover:text-navy"
                            title="Download Invoice PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
