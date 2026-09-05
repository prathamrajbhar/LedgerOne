"use server";

import { companySettingsService, UpdateCompanySettingsInput } from "@/lib/services/company-settings.service";
import { chartOfAccountsService } from "@/lib/services/chart-of-accounts.service";
import { AccountType } from "@prisma/client";

export async function getCompanySettingsAction() {
  try {
    const settings = await companySettingsService.get();
    return { success: true, data: settings };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch company settings" };
  }
}

export async function updateCompanySettingsAction(input: UpdateCompanySettingsInput) {
  try {
    const updated = await companySettingsService.update(input);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to update company settings" };
  }
}

export async function getAccountsForSettingsAction() {
  try {
    const assetAccounts = await chartOfAccountsService.getSelectableAccounts(AccountType.ASSET);
    const liabilityAccounts = await chartOfAccountsService.getSelectableAccounts(AccountType.LIABILITY);

    return {
      success: true,
      data: {
        assetAccounts,
        liabilityAccounts
      }
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch accounts" };
  }
}
