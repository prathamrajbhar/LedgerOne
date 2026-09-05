import { PageHeader } from "@/components/ui/page-header";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { getCompanySettingsAction, getAccountsForSettingsAction } from "@/app/actions/settings.actions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const [settingsResult, accountsResult] = await Promise.all([
    getCompanySettingsAction(),
    getAccountsForSettingsAction(),
  ]);

  if (!settingsResult.success || !settingsResult.data) {
    console.error("Failed to fetch company settings:", settingsResult.error);
    redirect("/error");
  }

  if (!accountsResult.success || !accountsResult.data) {
    console.error("Failed to fetch accounts:", accountsResult.error);
    redirect("/error");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Company & System Settings"
        description="Configure your company profile, fiscal year, document prefixes, and default accounts."
      />

      <CompanySettingsForm
        settings={settingsResult.data}
        assetAccounts={accountsResult.data.assetAccounts}
        liabilityAccounts={accountsResult.data.liabilityAccounts}
      />
    </div>
  );
}
