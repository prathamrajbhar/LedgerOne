"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, FileCheck } from "lucide-react";

const lineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  invoiceReference: z.string().optional(),
  salesOrderId: z.string().optional(),
  lines: z.array(lineSchema).min(1, "At least one line item is required"),
});

type FormValues = z.infer<typeof schema>;

interface CustomerInvoiceFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  loading: boolean;
}

export function CustomerInvoiceForm({
  defaultValues,
  onSubmit,
  loading,
}: CustomerInvoiceFormProps) {
  const [customerList, setCustomerList] = useState<{ id: string; name: string }[]>([]);
  const [productList, setProductList] = useState<{ id: string; name: string; salePrice?: number }[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const defaultDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

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
      invoiceDate: today,
      dueDate: defaultDueDate,
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

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/contacts?type=CUSTOMER");
        if (res.ok) {
          const data = await res.json();
          if (data?.data) setCustomerList(data.data);
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
    loadData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              {customerList.length > 0 ? (
                <select
                  id="customerId"
                  {...register("customerId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a customer...</option>
                  {customerList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="customerId"
                  placeholder="Customer Name or ID"
                  {...register("customerId")}
                />
              )}
              {errors.customerId && (
                <p className="text-xs text-destructive">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input type="date" id="invoiceDate" {...register("invoiceDate")} />
              {errors.invoiceDate && (
                <p className="text-xs text-destructive">
                  {errors.invoiceDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input type="date" id="dueDate" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="ref">Customer PO / Reference (Optional)</Label>
              <Input
                id="ref"
                placeholder="e.g. PO-84920"
                {...register("invoiceReference")}
              />
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Invoiced Line Items</h3>
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
                            if (prod?.salePrice) {
                              setValue(
                                `lines.${index}.unitPrice`,
                                Number(prod.salePrice)
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
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
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
                  <span>Invoice Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="gap-2">
              <FileCheck className="h-4 w-4" />
              {loading ? "Issuing Invoice..." : "Create Customer Invoice"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
