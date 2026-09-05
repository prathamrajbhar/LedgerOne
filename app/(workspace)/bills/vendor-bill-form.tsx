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
import { createStandaloneBillAction, getAnalyticAccountsAction } from "@/app/actions/purchase.actions";
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

export function VendorBillForm() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [vendors, setVendors] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = React.useState<any[]>([]);

  const [vendorId, setVendorId] = React.useState("");
  const [billDate, setBillDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
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
        const allVendors = vendorsResult.data.contacts || [];
        setVendors(allVendors);
      }

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data.data || []);
      }

      if (analyticAccountsResult.success && analyticAccountsResult.data) {
        setAnalyticAccounts(analyticAccountsResult.data);
      }
    } catch (error) {
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

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
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

    if (new Date(dueDate) < new Date(billDate)) {
      toast.error("Due date cannot be before bill date");
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
      const result = await createStandaloneBillAction({
        vendorId,
        billDate: new Date(billDate),
        dueDate: new Date(dueDate),
        lines: lines.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.analyticAccountId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });

      if (result.success) {
        toast.success("Vendor bill created successfully");
        setOpen(false);
        setVendorId("");
        setBillDate(new Date().toISOString().split("T")[0]);
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
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
        toast.error(result.error || "Failed to create vendor bill");
      }
    } catch (error) {
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
          New Vendor Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Vendor Bill</DialogTitle>
          <DialogDescription>
            Create a new vendor bill for goods or services received.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="billDate">Bill Date *</Label>
                <Input
                  id="billDate"
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  "Create Vendor Bill"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
