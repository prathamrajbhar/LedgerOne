"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { createSalesOrderAction } from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { SalesOrderLineInput } from "@/lib/services/sales-order.service";

interface SalesOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface LineItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string;
}

interface CustomerOption {
  id: string;
  name: string;
  type: string;
}

interface ProductOption {
  id: string;
  name: string;
  salesPrice: number | string;
}

export function SalesOrderForm({ open, onOpenChange, onSuccess }: SalesOrderFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [products, setProducts] = React.useState<ProductOption[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);

  const [customerId, setCustomerId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = React.useState("");
  const [lines, setLines] = React.useState<LineItem[]>([
    { productId: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Fetch customers and products when dialog opens
  React.useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const loadFormData = async () => {
    setLoadingData(true);
    try {
      const [customersResult, productsResult] = await Promise.all([
        getContactsAction({ type: "CUSTOMER", limit: 100 }),
        getProductsAction({ limit: 100 }),
      ]);

      if (customersResult.success && customersResult.data) {
        const contactData = customersResult.data as { contacts?: CustomerOption[] };
        const allCustomers = (contactData.contacts || []).filter(
          (c: { type: string }) => c.type === "CUSTOMER" || c.type === "BOTH"
        );
        setCustomers(allCustomers);
      }

      if (productsResult.success && productsResult.data) {
        const prodData = productsResult.data as { data?: ProductOption[] };
        setProducts(prodData.data || []);
      }
    } catch {
      toast.error("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { productId: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      toast.error("At least one line item is required");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    // If product is selected, auto-fill description and unit price
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newLines[index].description = product.name;
        newLines[index].unitPrice = Number(product.salesPrice);
      }
    }

    setLines(newLines);
  };

  const calculateLineTotal = (line: LineItem) => {
    return line.quantity * line.unitPrice;
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (!orderDate) {
      newErrors.orderDate = "Order date is required";
    }

    lines.forEach((line, index) => {
      if (!line.productId) {
        newErrors[`line_${index}_product`] = "Product is required";
      }
      if (line.quantity <= 0) {
        newErrors[`line_${index}_quantity`] = "Quantity must be greater than 0";
      }
      if (line.unitPrice < 0) {
        newErrors[`line_${index}_unitPrice`] = "Unit price cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const salesOrderLines: SalesOrderLineInput[] = lines.map((line) => ({
        productId: line.productId,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRateId: line.taxRateId,
      }));

      const result = await createSalesOrderAction({
        customerId,
        orderDate: new Date(orderDate),
        lines: salesOrderLines,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success("Sales order created successfully");
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create sales order");
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setLines([{ productId: "", description: "", quantity: 1, unitPrice: 0 }]);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Order</DialogTitle>
          <DialogDescription>
            Add a new sales order with line items and customer details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer and Date */}
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Customer"
              required
              value={customerId}
              onValueChange={(value) => {
                setCustomerId(value);
                if (errors.customerId) {
                  const newErrors = { ...errors };
                  delete newErrors.customerId;
                  setErrors(newErrors);
                }
              }}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer"
              error={errors.customerId}
              disabled={loadingData}
            />

            <FormInput
              label="Order Date"
              type="date"
              required
              value={orderDate}
              onChange={(e) => {
                setOrderDate(e.target.value);
                if (errors.orderDate) {
                  const newErrors = { ...errors };
                  delete newErrors.orderDate;
                  setErrors(newErrors);
                }
              }}
              error={errors.orderDate}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Line Items</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddLine}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Line
              </Button>
            </div>

            <div className="space-y-3 border border-border rounded-lg p-4 bg-gray-50">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start bg-white p-3 rounded-lg border border-border">
                  <div className="col-span-4">
                    <FormSelect
                      label="Product"
                      required
                      value={line.productId}
                      onValueChange={(value) => handleLineChange(index, "productId", value)}
                      options={products.map((p) => ({ value: p.id, label: p.name }))}
                      placeholder="Select product"
                      error={errors[`line_${index}_product`]}
                      disabled={loadingData}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormInput
                      label="Quantity"
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))}
                      error={errors[`line_${index}_quantity`]}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormInput
                      label="Unit Price"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))}
                      error={errors[`line_${index}_unitPrice`]}
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Line Total</label>
                    <div className="text-sm font-bold text-navy bg-gray-100 px-3 py-2 rounded-md border border-border">
                      ₹{calculateLineTotal(line).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-end justify-center pb-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveLine(index)}
                      disabled={lines.length === 1}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="bg-navy text-white px-6 py-3 rounded-lg">
                <span className="text-xs font-semibold mr-3">Total Amount:</span>
                <span className="text-lg font-bold">
                  ₹{calculateTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions..."
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingData}
              className="bg-navy hover:bg-navy-hover text-white gap-1.5"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Sales Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
