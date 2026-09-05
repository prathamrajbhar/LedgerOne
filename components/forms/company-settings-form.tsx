"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  CalendarDays,
  Hash,
  Lock,
  Unlock,
  Info,
  FileText,
  ShoppingCart,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
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
          {/* 1. Fiscal Year & Accounting Period Lock */}
          <Card className="p-6 bg-white shadow-card border border-border/80 rounded-xl">
            <CardHeader className="p-0 pb-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy border border-navy/10">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Fiscal Year & Period Lock
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Configure your 12-month accounting calendar cycle and period locking cutoff
                    </CardDescription>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold self-start sm:self-auto bg-surface-subtle border-border">
                  {fiscalPeriodClosedUntil ? (
                    <>
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-800">
                        Locked through {fiscalPeriodClosedUntil}
                      </span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-800">
                        All Periods Open
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fiscal Year Start Month */}
                <div className="space-y-2.5 p-4 rounded-xl bg-surface-subtle/60 border border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Accounting Calendar
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-navy/10 text-navy rounded-full">
                      12 Months Cycle
                    </span>
                  </div>
                  <FormSelect
                    label="Fiscal Year Start Month"
                    value={fiscalYearStartMonth}
                    onValueChange={setFiscalYearStartMonth}
                    options={monthOptions}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 shrink-0 text-navy" />
                    <span>
                      Fiscal cycle: <strong>{monthOptions.find((m) => m.value === fiscalYearStartMonth)?.label}</strong> to{" "}
                      <strong>
                        {
                          monthOptions[
                            (parseInt(fiscalYearStartMonth, 10) + 10) % 12
                          ]?.label
                        }
                      </strong>
                    </span>
                  </p>
                </div>

                {/* Fiscal Period Lock Date */}
                <div className="space-y-2.5 p-4 rounded-xl bg-surface-subtle/60 border border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Period Closing Guard
                    </span>
                    {fiscalPeriodClosedUntil && (
                      <button
                        type="button"
                        onClick={() => setFiscalPeriodClosedUntil("")}
                        className="text-[11px] font-semibold text-destructive hover:underline cursor-pointer"
                      >
                        Clear Lock Date
                      </button>
                    )}
                  </div>
                  <FormInput
                    label="Fiscal Period Closed Until"
                    type="date"
                    value={fiscalPeriodClosedUntil}
                    onChange={(e) => setFiscalPeriodClosedUntil(e.target.value)}
                    helperText="Transactions on or prior to this cutoff date cannot be posted or edited"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>
                      Enforces audit safety for closed quarterly or year-end financial accounts.
                    </span>
                  </p>
                </div>
              </div>

              {/* Information Note */}
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-navy/5 border border-navy/10 text-xs text-navy">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-navy" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Audit Compliance Rule</span>
                  <p className="text-navy/80 leading-relaxed">
                    Locking an accounting period freezes historical vouchers, journal entries, and finalized tax reports. Unposted drafts dated inside the closed period must be moved to an open period before posting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Document Number Prefixes */}
          <Card className="p-6 bg-white shadow-card border border-border/80 rounded-xl">
            <CardHeader className="p-0 pb-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal border border-teal/20">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Document Sequence Prefixes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Standardized prefixes for auto-generated business vouchers and order references
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module 1: Sales & Accounts Receivable */}
                <div className="space-y-4 p-4 rounded-xl bg-surface-subtle/50 border border-border/70">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                    <FileText className="h-4 w-4 text-teal" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Sales & Receivables
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <FormInput
                        label="Customer Invoice Prefix"
                        required
                        value={invoiceNumberPrefix}
                        onChange={(e) => setInvoiceNumberPrefix(e.target.value.toUpperCase())}
                        placeholder="INV"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Format:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-teal">
                          {invoiceNumberPrefix || "INV"}-{new Date().getFullYear()}-0001
                        </code>
                      </div>
                    </div>

                    <div>
                      <FormInput
                        label="Sales Order Prefix"
                        required
                        value={soNumberPrefix}
                        onChange={(e) => setSoNumberPrefix(e.target.value.toUpperCase())}
                        placeholder="SO"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Format:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-teal">
                          {soNumberPrefix || "SO"}-{new Date().getFullYear()}-0001
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 2: Purchases & Accounts Payable */}
                <div className="space-y-4 p-4 rounded-xl bg-surface-subtle/50 border border-border/70">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                    <ShoppingCart className="h-4 w-4 text-navy" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Purchases & Payables
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <FormInput
                        label="Purchase Order Prefix"
                        required
                        value={poNumberPrefix}
                        onChange={(e) => setPoNumberPrefix(e.target.value.toUpperCase())}
                        placeholder="PO"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Format:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-navy">
                          {poNumberPrefix || "PO"}-{new Date().getFullYear()}-0001
                        </code>
                      </div>
                    </div>

                    <div>
                      <FormInput
                        label="Vendor Bill Prefix"
                        required
                        value={billNumberPrefix}
                        onChange={(e) => setBillNumberPrefix(e.target.value.toUpperCase())}
                        placeholder="BILL"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Format:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-navy">
                          {billNumberPrefix || "BILL"}-{new Date().getFullYear()}-0001
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 3: General Ledger */}
                <div className="space-y-4 p-4 rounded-xl bg-surface-subtle/50 border border-border/70">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      General Ledger
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <FormInput
                        label="Journal Entry Prefix"
                        required
                        value={jeNumberPrefix}
                        onChange={(e) => setJeNumberPrefix(e.target.value.toUpperCase())}
                        placeholder="JE"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Format:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-emerald-700">
                          {jeNumberPrefix || "JE"}-{new Date().getFullYear()}-0001
                        </code>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-900 leading-relaxed">
                      Used across all manual accounting entries, adjustments, and automated double-entry postings.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-border/80 shadow-xs">
        <p className="text-xs text-muted-foreground">
          Modifications will take immediate effect for all newly created documents and posting validations.
        </p>
        <Button
          type="submit"
          className="bg-navy hover:bg-navy-hover text-white gap-2 font-semibold shadow-xs transition-all"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
