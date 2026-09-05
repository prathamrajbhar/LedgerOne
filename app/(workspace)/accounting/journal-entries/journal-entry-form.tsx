"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Scale, AlertCircle, CheckCircle2 } from "lucide-react";

const lineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  partnerId: z.string().optional(),
  debit: z.coerce.number().min(0, "Debit cannot be negative"),
  credit: z.coerce.number().min(0, "Credit cannot be negative"),
});

const schema = z.object({
  journalId: z.string().min(1, "Journal is required"),
  accountingDate: z.string().min(1, "Date is required"),
  lines: z.array(lineSchema).min(2, "At least two lines required for double-entry"),
});

type FormValues = z.infer<typeof schema>;

interface JournalEntryFormProps {
  onSubmit: (data: FormValues) => void;
  loading: boolean;
}

export function JournalEntryForm({ onSubmit, loading }: JournalEntryFormProps) {
  const [journals, setJournals] = useState<{ id: string; name: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string; code: string }[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountingDate: today,
      lines: [
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const totalDebit = (watchedLines || []).reduce(
    (sum, l) => sum + (Number(l?.debit) || 0),
    0
  );
  const totalCredit = (watchedLines || []).reduce(
    (sum, l) => sum + (Number(l?.credit) || 0),
    0
  );
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001 && totalDebit > 0;

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/journals");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) setJournals(d.data);
        }
      } catch {}
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) setAccounts(d.data);
        }
      } catch {}
      try {
        const res = await fetch("/api/contacts");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) setPartners(d.data);
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
            <div className="space-y-2">
              <Label htmlFor="journalId">Journal *</Label>
              {journals.length > 0 ? (
                <select
                  id="journalId"
                  {...register("journalId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select journal...</option>
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="journalId"
                  placeholder="Journal Name or ID"
                  {...register("journalId")}
                />
              )}
              {errors.journalId && (
                <p className="text-xs text-destructive">
                  {errors.journalId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountingDate">Accounting Date *</Label>
              <Input
                type="date"
                id="accountingDate"
                {...register("accountingDate")}
              />
              {errors.accountingDate && (
                <p className="text-xs text-destructive">
                  {errors.accountingDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Double-entry lines */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Journal Entry Lines
                </h3>
                <p className="text-xs text-muted-foreground">
                  Debits and Credits must exactly balance before posting.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ accountId: "", debit: 0, credit: 0 })
                }
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border bg-gray-50/50"
                >
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    <Label className="text-xs">Account *</Label>
                    {accounts.length > 0 ? (
                      <select
                        {...register(`lines.${index}.accountId` as const)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select account...</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Account Code / ID"
                        {...register(`lines.${index}.accountId` as const)}
                      />
                    )}
                    {errors.lines?.[index]?.accountId && (
                      <p className="text-xs text-destructive">
                        {errors.lines[index]?.accountId?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-12 sm:col-span-3 space-y-1">
                    <Label className="text-xs">Partner (Optional)</Label>
                    {partners.length > 0 ? (
                      <select
                        {...register(`lines.${index}.partnerId` as const)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">None</option>
                        {partners.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Partner Name/ID"
                        {...register(`lines.${index}.partnerId` as const)}
                      />
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Debit ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`lines.${index}.debit` as const)}
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Credit ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`lines.${index}.credit` as const)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    {fields.length > 2 && (
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

            {/* Balance Status Banner */}
            <div className="p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    Entry is balanced (Debit = Credit = ${totalDebit.toFixed(2)})
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                    <AlertCircle className="h-5 w-5" />
                    Difference: ${difference.toFixed(2)} (Total Debit: ${totalDebit.toFixed(2)} vs Total Credit: ${totalCredit.toFixed(2)})
                  </div>
                )}
              </div>

              <div className="text-right text-xs text-muted-foreground">
                Requirement: Balance must be $0.00 to post.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading || !isBalanced}
              className="gap-2"
            >
              <Scale className="h-4 w-4" />
              {loading ? "Recording Entry..." : "Create Journal Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
