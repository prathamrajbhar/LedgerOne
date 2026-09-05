"use server";

import { revalidatePath } from "next/cache";
import {
  analyticAccountService,
  CreateAnalyticAccountInput,
  UpdateAnalyticAccountInput,
  ListAnalyticAccountsParams,
} from "@/lib/services/analytic-account.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";

export interface AnalyticAccountActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get list of analytic accounts with optional filters
 */
export async function getAnalyticAccountsAction(params?: ListAnalyticAccountsParams): Promise<AnalyticAccountActionResult> {
  try {
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
  } catch (error) {
    console.error("Error fetching analytic accounts:", error);
    return {
      success: false,
      error: "Failed to fetch analytic accounts. Please try again.",
    };
  }
}

/**
 * Get a single analytic account by ID
 */
export async function getAnalyticAccountByIdAction(id: string): Promise<AnalyticAccountActionResult> {
  try {
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
      return {
        success: false,
        error: "Analytic account not found",
      };
    }
    console.error("Error fetching analytic account:", error);
    return {
      success: false,
      error: "Failed to fetch analytic account details. Please try again.",
    };
  }
}

/**
 * Create a new analytic account
 */
export async function createAnalyticAccountAction(input: CreateAnalyticAccountInput): Promise<AnalyticAccountActionResult> {
  try {
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
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error creating analytic account:", error);
    return {
      success: false,
      error: "Failed to create analytic account. Please try again.",
    };
  }
}

/**
 * Update an existing analytic account
 */
export async function updateAnalyticAccountAction(input: UpdateAnalyticAccountInput): Promise<AnalyticAccountActionResult> {
  try {
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
      return {
        success: false,
        error: "Analytic account not found",
      };
    }
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error updating analytic account:", error);
    return {
      success: false,
      error: "Failed to update analytic account. Please try again.",
    };
  }
}

/**
 * Delete an analytic account (only if not in use)
 */
export async function deleteAnalyticAccountAction(id: string): Promise<AnalyticAccountActionResult> {
  try {
    await analyticAccountService.delete(id);

    revalidatePath("/analytic-accounts");

    return {
      success: true,
      data: { message: "Analytic account deleted successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Analytic account not found",
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error deleting analytic account:", error);
    return {
      success: false,
      error: "Failed to delete analytic account. Please try again.",
    };
  }
}
