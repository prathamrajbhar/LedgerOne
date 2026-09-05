"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPurchaseOrderAction, getAnalyticAccountsAction } from "@/app/actions/purchase.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";

interface LineItem {
  id: string;
  productId: string;
  analyticAccountId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface VendorOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku?: string;
  cost: number | string;
}

interface AnalyticAccountOption {
  id: string;
  name: string;
  code?: string;
}

export function PurchaseOrderForm() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [vendors, setVendors] = React.useState<VendorOption[]>([]);
  const [products, setProducts] = React.useState<ProductOption[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = React.useState<AnalyticAccountOption[]>([]);

  const [vendorId, setVendorId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = React.useState<LineItem[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      analyticAccountId: "",
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    },
  ]);

  React.useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [vendorsResult, productsResult, analyticAccountsResult] = await Promise.all([
        getContactsAction({ type: "VENDOR" }),
        getProductsAction({ includeArchived: false }),
        getAnalyticAccountsAction(),
      ]);

      if (vendorsResult.success && vendorsResult.data) {
        const contactData = vendorsResult.data as { contacts?: VendorOption[] };
        const allVendors = contactData.contacts || [];
        setVendors(allVendors);
      }

      if (productsResult.success && productsResult.data) {
        const prodData = productsResult.data as { data?: ProductOption[] };
        setProducts(prodData.data || []);
      }

      if (analyticAccountsResult.success && analyticAccountsResult.data) {
        setAnalyticAccounts(analyticAccountsResult.data as AnalyticAccountOption[]);
      }
    } catch {
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: "",
        analyticAccountId: "",
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;

        const updated = { ...line, [field]: value };

        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          if (product) {
            updated.unitPrice = Number(product.cost);
          }
        }

        if (field === "quantity" || field === "unitPrice") {
          updated.lineTotal = updated.quantity * updated.unitPrice;
        }

        return updated;
      })
    );
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => sum + line.lineTotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    if (lines.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const invalidLine = lines.find(
      (line) => !line.productId || !line.analyticAccountId || line.quantity <= 0
    );

    if (invalidLine) {
      toast.error("Please fill in all line item fields");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createPurchaseOrderAction({
        vendorId,
        orderDate: new Date(orderDate),
        lines: lines.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.analyticAccountId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });

      if (result.success) {
        toast.success("Purchase order created successfully");
        setOpen(false);
        setVendorId("");
        setOrderDate(new Date().toISOString().split("T")[0]);
        setLines([
          {
            id: Math.random().toString(36).substr(2, 9),
            productId: "",
            analyticAccountId: "",
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0,
          },
        ]);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to create purchase order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for vendor supplies and materials.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Line Items *</Label>
                <Button type="button" size="sm" variant="outline" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Line
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-2 px-3 text-left font-semibold">Product</th>
                      <th className="py-2 px-3 text-left font-semibold">Analytic Account</th>
                      <th className="py-2 px-3 text-center font-semibold">Qty</th>
                      <th className="py-2 px-3 text-right font-semibold">Unit Price</th>
                      <th className="py-2 px-3 text-right font-semibold">Total</th>
                      <th className="py-2 px-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2 px-3">
                          <Select
                            value={line.productId}
                            onValueChange={(value) => updateLine(line.id, "productId", value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-3">
                          <Select
                            value={line.analyticAccountId}
                            onValueChange={(value) =>
                              updateLine(line.id, "analyticAccountId", value)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {analyticAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)
                            }
                            className="h-8 text-xs text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) =>
                              updateLine(line.id, "unitPrice", parseFloat(e.target.value) || 0)
                            }
                            className="h-8 text-xs text-right"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-semibold">
                          ₹{line.lineTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLine(line.id)}
                            disabled={lines.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-bold">
                      <td colSpan={4} className="py-2 px-3 text-right">
                        Total:
                      </td>
                      <td className="py-2 px-3 text-right">
                        ₹{calculateTotal().toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Purchase Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
