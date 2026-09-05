"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, BarChart2 } from "lucide-react";

const lineSchema = z.object({
  analyticAccountId: z.string().min(1, "Analytic account is required"),
  type: z.enum(["INCOME", "EXPENSES"]),
  committedAmount: z.coerce.number().min(1, "Target amount must be at least 1"),
});

const schema = z.object({
  name: z.string().min(1, "Budget name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  responsibleId: z.string().min(1, "Responsible person is required"),
  lines: z.array(lineSchema).min(1, "At least one target line required"),
});

type FormValues = z.infer<typeof schema>;

interface BudgetFormProps {
  onSubmit: (data: FormValues) => void;
  loading: boolean;
}

export function BudgetForm({ onSubmit, loading }: BudgetFormProps) {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<{ id: string; name: string; type: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: today,
      endDate: endOfYear,
      lines: [{ analyticAccountId: "", type: "EXPENSES", committedAmount: 1000 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) setUsers(d.data);
        }
      } catch {}
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) setAnalyticAccounts(d.data);
        }
      } catch {}
    }
    loadData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Q4 Operations & Sales Budget"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input type="date" id="startDate" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input type="date" id="endDate" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="responsibleId">Responsible Person *</Label>
              {users.length > 0 ? (
                <select
                  id="responsibleId"
                  {...register("responsibleId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select responsible user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="responsibleId"
                  placeholder="Responsible User ID"
                  {...register("responsibleId")}
                />
              )}
              {errors.responsibleId && (
                <p className="text-xs text-destructive">
                  {errors.responsibleId.message}
                </p>
              )}
            </div>
          </div>

          {/* Budget Lines */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Target Analytic Accounts
                </h3>
                <p className="text-xs text-muted-foreground">
                  Committed budget amounts for expense controls or sales targets.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ analyticAccountId: "", type: "EXPENSES", committedAmount: 1000 })
                }
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Target Line
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border bg-gray-50/50"
                >
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <Label className="text-xs">Analytic Account *</Label>
                    {analyticAccounts.length > 0 ? (
                      <select
                        {...register(`lines.${index}.analyticAccountId` as const)}
                        onChange={(e) => {
                          const acc = analyticAccounts.find(
                            (a) => a.id === e.target.value
                          );
                          if (acc) {
                            setValue(
                              `lines.${index}.type` as const,
                              acc.type as any
                            );
                          }
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select analytic account...</option>
                        {analyticAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.type})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Analytic Account ID"
                        {...register(`lines.${index}.analyticAccountId` as const)}
                      />
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-xs">Type</Label>
                    <select
                      {...register(`lines.${index}.type` as const)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="EXPENSES">Expense Budget</option>
                      <option value="INCOME">Revenue Target</option>
                    </select>
                  </div>

                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-xs">Committed Amount ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      {...register(`lines.${index}.committedAmount` as const)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
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
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="gap-2">
              <BarChart2 className="h-4 w-4" />
              {loading ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
