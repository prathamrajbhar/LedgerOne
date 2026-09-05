import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { getCompanySettingsAction, getAccountsForSettingsAction } from "@/app/actions/settings.actions";
import { redirect } from "next/navigation";
import { Building2, Users } from "lucide-react";

export default async function SettingsPage() {
  const [settingsResult, accountsResult] = await Promise.all([
    getCompanySettingsAction(),
    getAccountsForSettingsAction(),
  ]);

  if (!settingsResult.success || !settingsResult.data || !accountsResult.success || !accountsResult.data) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-medium">
        <Link
          href="/settings"
          className="pb-3 border-b-2 border-navy text-navy font-bold flex items-center gap-1.5"
        >
          <Building2 className="h-4 w-4" /> Company Profile
        </Link>
        <Link
          href="/settings/users"
          className="pb-3 text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <Users className="h-4 w-4" /> User & Portal Management
        </Link>
      </div>

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
