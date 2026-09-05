import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="space-y-6">
      <PageHeader
        title="Fiscal Year & Document Numbering"
        description="Configure accounting periods, period locking dates, and auto-generated document prefixes."
      />

      <CompanySettingsForm
        settings={settingsResult.data}
        assetAccounts={accountsResult.data.assetAccounts}
        liabilityAccounts={accountsResult.data.liabilityAccounts}
        defaultSection="fiscal"
      />
    </div>
  );
}
