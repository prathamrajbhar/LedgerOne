"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Users, Building } from "lucide-react";
import Link from "next/link";

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  baseCurrency: z.string().min(1, "Currency is required"),
  fiscalYearStartMonth: z.coerce.number().min(1).max(12),
  poNumberPrefix: z.string().min(1, "PO prefix is required"),
  billNumberPrefix: z.string().min(1, "Bill prefix is required"),
  soNumberPrefix: z.string().min(1, "SO prefix is required"),
  invoiceNumberPrefix: z.string().min(1, "Invoice prefix is required"),
  jeNumberPrefix: z.string().min(1, "JE prefix is required"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          reset(data);
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("Company settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Company Settings"
        description="Manage company details, base currency, fiscal year, and sequence prefixes."
        actions={
          <Link href="/settings/users">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" /> Manage Users & Roles
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g. Acme Corporation"
                {...register("companyName")}
                disabled={fetching}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Operating Address</Label>
              <Input
                id="address"
                placeholder="Business Street, City, Country"
                {...register("address")}
                disabled={fetching}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency *</Label>
                <select
                  id="baseCurrency"
                  {...register("baseCurrency")}
                  disabled={fetching}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                {errors.baseCurrency && (
                  <p className="text-xs text-destructive">
                    {errors.baseCurrency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYearStartMonth">Fiscal Year Start Month (1-12) *</Label>
                <Input
                  id="fiscalYearStartMonth"
                  type="number"
                  min="1"
                  max="12"
                  {...register("fiscalYearStartMonth")}
                  disabled={fetching}
                />
                {errors.fiscalYearStartMonth && (
                  <p className="text-xs text-destructive">
                    {errors.fiscalYearStartMonth.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Document Numbering Prefixes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poNumberPrefix">Purchase Order (PO)</Label>
              <Input
                id="poNumberPrefix"
                {...register("poNumberPrefix")}
                disabled={fetching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billNumberPrefix">Vendor Bill</Label>
              <Input
                id="billNumberPrefix"
                {...register("billNumberPrefix")}
                disabled={fetching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soNumberPrefix">Sales Order (SO)</Label>
              <Input
                id="soNumberPrefix"
                {...register("soNumberPrefix")}
                disabled={fetching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumberPrefix">Customer Invoice (INV)</Label>
              <Input
                id="invoiceNumberPrefix"
                {...register("invoiceNumberPrefix")}
                disabled={fetching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jeNumberPrefix">Journal Entry (JE)</Label>
              <Input
                id="jeNumberPrefix"
                {...register("jeNumberPrefix")}
                disabled={fetching}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || fetching} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
