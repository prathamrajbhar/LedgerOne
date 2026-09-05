"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";

const lineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

const schema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDate: z.string().optional(),
  lines: z.array(lineSchema).min(1, "At least one line item is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PurchaseOrderFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  loading: boolean;
  vendors?: { id: string; name: string }[];
  products?: { id: string; name: string; purchasePrice?: number }[];
}

export function PurchaseOrderForm({
  defaultValues,
  onSubmit,
  loading,
  vendors = [],
  products = [],
}: PurchaseOrderFormProps) {
  const [vendorList, setVendorList] = useState(vendors);
  const [productList, setProductList] = useState(products);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderDate: new Date().toISOString().split("T")[0],
      lines: [{ productId: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const totalAmount = (watchedLines || []).reduce((sum, item) => {
    const q = Number(item?.quantity) || 0;
    const p = Number(item?.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  // Fetch vendors and products if not passed as props
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/contacts?type=VENDOR");
        if (res.ok) {
          const data = await res.json();
          if (data?.data) setVendorList(data.data);
        }
      } catch {}
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data?.data) setProductList(data.data);
        }
      } catch {}
    }
    if (vendors.length === 0 || products.length === 0) {
      loadData();
    }
  }, [vendors.length, products.length]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor *</Label>
              {vendorList.length > 0 ? (
                <select
                  id="vendorId"
                  {...register("vendorId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a vendor...</option>
                  {vendorList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="vendorId"
                  placeholder="Enter Vendor Name or ID"
                  {...register("vendorId")}
                />
              )}
              {errors.vendorId && (
                <p className="text-xs text-destructive">
                  {errors.vendorId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date *</Label>
              <Input type="date" id="orderDate" {...register("orderDate")} />
              {errors.orderDate && (
                <p className="text-xs text-destructive">
                  {errors.orderDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedDate">Expected Delivery Date</Label>
              <Input
                type="date"
                id="expectedDate"
                {...register("expectedDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional PO notes or delivery instructions"
                {...register("notes")}
              />
            </div>
          </div>

          {/* Line items section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productId: "", quantity: 1, unitPrice: 0 })
                }
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            {errors.lines?.root && (
              <p className="text-xs text-destructive">
                {errors.lines.root.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const currentLine = watchedLines?.[index];
                const lineTotal =
                  (Number(currentLine?.quantity) || 0) *
                  (Number(currentLine?.unitPrice) || 0);

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border bg-gray-50/50"
                  >
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <Label className="text-xs">Product *</Label>
                      {productList.length > 0 ? (
                        <select
                          {...register(`lines.${index}.productId` as const)}
                          onChange={(e) => {
                            const prod = productList.find(
                              (p) => p.id === e.target.value
                            );
                            if (prod?.purchasePrice) {
                              setValue(
                                `lines.${index}.unitPrice`,
                                Number(prod.purchasePrice)
                              );
                            }
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">Select product...</option>
                          {productList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          placeholder="Product Name or ID"
                          {...register(`lines.${index}.productId` as const)}
                        />
                      )}
                      {errors.lines?.[index]?.productId && (
                        <p className="text-xs text-destructive">
                          {errors.lines[index]?.productId?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...register(`lines.${index}.quantity` as const)}
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`lines.${index}.unitPrice` as const)}
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2 space-y-1 text-right">
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <div className="h-9 flex items-center justify-end font-semibold text-sm">
                        ${lineTotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-9 w-9 p-0 text-gray-400 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="gap-2">
              <Calculator className="h-4 w-4" />
              {loading ? "Saving Order..." : "Create Purchase Order"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
