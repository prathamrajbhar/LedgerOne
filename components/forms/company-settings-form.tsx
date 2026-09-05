"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { updateCompanySettingsAction } from "@/app/actions/settings.actions";
import { CompanySettings, ChartOfAccount } from "@prisma/client";

interface CompanySettingsFormProps {
  settings: CompanySettings;
  assetAccounts: ChartOfAccount[];
  liabilityAccounts: ChartOfAccount[];
  defaultSection?: "all" | "profile" | "fiscal";
}

export function CompanySettingsForm({
  settings,
  assetAccounts,
  liabilityAccounts,
  defaultSection = "all",
}: CompanySettingsFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [companyName, setCompanyName] = React.useState(settings.companyName);
  const [address, setAddress] = React.useState(settings.address || "");
  const [currency, setCurrency] = React.useState(settings.baseCurrency);
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = React.useState(
    settings.fiscalYearStartMonth.toString()
  );
  const [fiscalPeriodClosedUntil, setFiscalPeriodClosedUntil] = React.useState(
    settings.fiscalPeriodClosedUntil
      ? new Date(settings.fiscalPeriodClosedUntil).toISOString().split("T")[0]
      : ""
  );
  const [poNumberPrefix, setPoNumberPrefix] = React.useState(settings.poNumberPrefix);
  const [billNumberPrefix, setBillNumberPrefix] = React.useState(settings.billNumberPrefix);
  const [soNumberPrefix, setSoNumberPrefix] = React.useState(settings.soNumberPrefix);
  const [invoiceNumberPrefix, setInvoiceNumberPrefix] = React.useState(settings.invoiceNumberPrefix);
  const [jeNumberPrefix, setJeNumberPrefix] = React.useState(settings.jeNumberPrefix);
  const [debtorsAccountId, setDebtorsAccountId] = React.useState(settings.debtorsAccountId || "");
  const [creditorsAccountId, setCreditorsAccountId] = React.useState(settings.creditorsAccountId || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCompanySettingsAction({
        companyName: companyName.trim(),
        address: address.trim() || undefined,
        baseCurrency: currency,
        fiscalYearStartMonth: parseInt(fiscalYearStartMonth, 10),
        fiscalPeriodClosedUntil: fiscalPeriodClosedUntil ? new Date(fiscalPeriodClosedUntil) : null,
        poNumberPrefix,
        billNumberPrefix,
        soNumberPrefix,
        invoiceNumberPrefix,
        jeNumberPrefix,
        debtorsAccountId: debtorsAccountId || undefined,
        creditorsAccountId: creditorsAccountId || undefined,
      });

      if (result.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const currencyOptions = [
    { value: "USD", label: "USD ($) - US Dollar" },
    { value: "EUR", label: "EUR (€) - Euro" },
    { value: "GBP", label: "GBP (£) - British Pound" },
    { value: "INR", label: "INR (₹) - Indian Rupee" },
    { value: "AUD", label: "AUD (A$) - Australian Dollar" },
    { value: "CAD", label: "CAD (C$) - Canadian Dollar" },
    { value: "JPY", label: "JPY (¥) - Japanese Yen" },
    { value: "CNY", label: "CNY (¥) - Chinese Yuan" },
  ];

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const assetAccountOptions = assetAccounts.map((acc) => ({
    value: acc.id,
    label: `${acc.code} - ${acc.name}`,
  }));

  const liabilityAccountOptions = liabilityAccounts.map((acc) => ({
    value: acc.id,
    label: `${acc.code} - ${acc.name}`,
  }));

  const showProfile = defaultSection === "all" || defaultSection === "profile";
  const showFiscal = defaultSection === "all" || defaultSection === "fiscal";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {showProfile && (
        <>
          <Card className="p-6 bg-white shadow-card">
            <CardHeader className="p-0 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground">
                Company Information
              </CardTitle>
              <CardDescription>
                Basic company details, business identity, and primary currency
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
              <FormSelect
                label="Base Currency"
                value={currency}
                onValueChange={setCurrency}
                options={currencyOptions}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Company Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter full company address"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-white shadow-card">
            <CardHeader className="p-0 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground">
                Default Accounts
              </CardTitle>
              <CardDescription>
                Configure default accounts for customer receivables and vendor payables
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Debtors Account (Receivables)"
                value={debtorsAccountId}
                onValueChange={setDebtorsAccountId}
                options={[
                  { value: "", label: "-- Select Asset Account --" },
                  ...assetAccountOptions,
                ]}
                helperText="Default account for customer receivables"
              />
              <FormSelect
                label="Creditors Account (Payables)"
                value={creditorsAccountId}
                onValueChange={setCreditorsAccountId}
                options={[
                  { value: "", label: "-- Select Liability Account --" },
                  ...liabilityAccountOptions,
                ]}
                helperText="Default account for vendor payables"
              />
            </CardContent>
          </Card>
        </>
      )}

      {showFiscal && (
        <>
          <Card className="p-6 bg-white shadow-card">
            <CardHeader className="p-0 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground">
                Fiscal Year Settings
              </CardTitle>
              <CardDescription>
                Configure accounting periods and financial period locking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Fiscal Year Start Month"
                value={fiscalYearStartMonth}
                onValueChange={setFiscalYearStartMonth}
                options={monthOptions}
              />
              <FormInput
                label="Fiscal Period Closed Until"
                type="date"
                value={fiscalPeriodClosedUntil}
                onChange={(e) => setFiscalPeriodClosedUntil(e.target.value)}
                helperText="Journal entries on or before this date will be locked"
              />
            </CardContent>
          </Card>

          <Card className="p-6 bg-white shadow-card">
            <CardHeader className="p-0 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground">
                Document Number Prefixes
              </CardTitle>
              <CardDescription>
                Prefixes for auto-generated business vouchers and order numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                label="Purchase Order Prefix"
                required
                value={poNumberPrefix}
                onChange={(e) => setPoNumberPrefix(e.target.value)}
                placeholder="PO"
              />
              <FormInput
                label="Vendor Bill Prefix"
                required
                value={billNumberPrefix}
                onChange={(e) => setBillNumberPrefix(e.target.value)}
                placeholder="BILL"
              />
              <FormInput
                label="Sales Order Prefix"
                required
                value={soNumberPrefix}
                onChange={(e) => setSoNumberPrefix(e.target.value)}
                placeholder="SO"
              />
              <FormInput
                label="Customer Invoice Prefix"
                required
                value={invoiceNumberPrefix}
                onChange={(e) => setInvoiceNumberPrefix(e.target.value)}
                placeholder="INV"
              />
              <FormInput
                label="Journal Entry Prefix"
                required
                value={jeNumberPrefix}
                onChange={(e) => setJeNumberPrefix(e.target.value)}
                placeholder="JE"
              />
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          size="sm"
          className="bg-navy hover:bg-navy-hover text-white gap-1.5"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
