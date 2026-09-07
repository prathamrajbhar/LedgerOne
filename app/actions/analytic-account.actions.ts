"use server";

import { revalidatePath } from "next/cache";
import {
  analyticAccountService,
  CreateAnalyticAccountInput,
  UpdateAnalyticAccountInput,
  ListAnalyticAccountsParams,
} from "@/lib/services/analytic-account.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";
import { requirePermission } from "@/lib/auth/guard";

export interface AnalyticAccountActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAnalyticAccountsAction(params?: ListAnalyticAccountsParams): Promise<AnalyticAccountActionResult> {
  try {
    await requirePermission("accounting:read");
    const accounts = await analyticAccountService.list(params || {});

    const transformedData = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: transformedData,
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch analytic accounts. Please try again.",
    };
  }
}

export async function getAnalyticAccountByIdAction(id: string): Promise<AnalyticAccountActionResult> {
  try {
    await requirePermission("accounting:read");
    const account = await analyticAccountService.findById(id);
    return {
      success: true,
      data: {
        id: account.id,
        name: account.name,
        type: account.type,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Analytic account not found" };
    }
    return { success: false, error: "Failed to fetch analytic account details. Please try again." };
  }
}

export async function createAnalyticAccountAction(input: CreateAnalyticAccountInput): Promise<AnalyticAccountActionResult> {
  try {
    await requirePermission("accounting:write");
    const account = await analyticAccountService.create(input);
    revalidatePath("/analytic-accounts");

    return {
      success: true,
      data: {
        id: account.id,
        name: account.name,
        type: account.type,
      },
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create analytic account. Please try again." };
  }
}

export async function updateAnalyticAccountAction(input: UpdateAnalyticAccountInput): Promise<AnalyticAccountActionResult> {
  try {
    await requirePermission("accounting:write");
    const account = await analyticAccountService.update(input);
    revalidatePath("/analytic-accounts");

    return {
      success: true,
      data: {
        id: account.id,
        name: account.name,
        type: account.type,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Analytic account not found" };
    }
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update analytic account. Please try again." };
  }
}

export async function deleteAnalyticAccountAction(id: string): Promise<AnalyticAccountActionResult> {
  try {
    await requirePermission("settings:manage");
    await analyticAccountService.delete(id);
    revalidatePath("/analytic-accounts");

    return {
      success: true,
      data: { message: "Analytic account deleted successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Analytic account not found" };
    }
    if (error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete analytic account. Please try again." };
  }
}
