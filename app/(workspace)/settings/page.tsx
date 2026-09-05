"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = React.useState("Royal Oak Woodcrafts Pvt Ltd");
  const [gstin, setGstin] = React.useState("27AAAAA1234A1Z5");
  const [currency, setCurrency] = React.useState("INR");
  const [fiscalYear, setFiscalYear] = React.useState("APR_MAR");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Company settings saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Company & System Settings"
        description="Configure your enterprise profile, tax identification numbers, and accounting periods."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Company Legal Identity
            </CardTitle>
            <CardDescription>
              Details printed on sales invoices and purchase vouchers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Registered Business Name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <FormInput
              label="GSTIN Number"
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />
            <FormSelect
              label="Base Currency"
              value={currency}
              onValueChange={setCurrency}
              options={[
                { value: "INR", label: "INR (₹) - Indian Rupee" },
                { value: "USD", label: "USD ($) - US Dollar" },
              ]}
            />
            <FormSelect
              label="Fiscal Year Schedule"
              value={fiscalYear}
              onValueChange={setFiscalYear}
              options={[
                { value: "APR_MAR", label: "April 1 - March 31 (Standard Indian FY)" },
                { value: "JAN_DEC", label: "January 1 - December 31 (Calendar Year)" },
              ]}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
