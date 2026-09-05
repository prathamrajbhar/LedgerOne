import * as React from "react";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { getCompanySettingsAction, getAccountsForSettingsAction } from "@/app/actions/settings.actions";
import { redirect } from "next/navigation";

export default async function FiscalYearSettingsPage() {
  const [settingsResult, accountsResult] = await Promise.all([
    getCompanySettingsAction(),
    getAccountsForSettingsAction(),
  ]);

  if (!settingsResult.success || !settingsResult.data || !accountsResult.success || !accountsResult.data) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-navy/10 text-navy border border-navy/15">
              Financial Administration
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-medium text-muted-foreground">
              Period & Numbering Rules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
            Fiscal Year & Numbering
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure accounting periods, period locking cutoffs, and auto-generated document prefixes.
          </p>
        </div>
      </div>

      <CompanySettingsForm
        settings={settingsResult.data}
        assetAccounts={accountsResult.data.assetAccounts}
        liabilityAccounts={accountsResult.data.liabilityAccounts}
        defaultSection="fiscal"
      />
    </div>
  );
}
