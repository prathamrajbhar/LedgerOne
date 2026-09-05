"use server";

import { revalidatePath } from "next/cache";
import {
  taxRateService,
  CreateTaxRateInput,
  UpdateTaxRateInput,
  ListTaxRatesParams,
} from "@/lib/services/tax-rate.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";

export interface TaxRateActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get list of tax rates with optional filters
 */
export async function getTaxRatesAction(params?: ListTaxRatesParams): Promise<TaxRateActionResult> {
  try {
    const taxRates = await taxRateService.list(params || {});

    const transformedData = taxRates.map((rate) => ({
      id: rate.id,
      name: rate.name,
      percentage: Number(rate.percentage),
      applicability: rate.applicability,
      createdAt: rate.createdAt.toISOString(),
      updatedAt: rate.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error("Error fetching tax rates:", error);
    return {
      success: false,
      error: "Failed to fetch tax rates. Please try again.",
    };
  }
}

/**
 * Get a single tax rate by ID
 */
export async function getTaxRateByIdAction(id: string): Promise<TaxRateActionResult> {
  try {
    const taxRate = await taxRateService.findById(id);
    return {
      success: true,
      data: {
        id: taxRate.id,
        name: taxRate.name,
        percentage: Number(taxRate.percentage),
        applicability: taxRate.applicability,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Tax rate not found",
      };
    }
    console.error("Error fetching tax rate:", error);
    return {
      success: false,
      error: "Failed to fetch tax rate details. Please try again.",
    };
  }
}

/**
 * Create a new tax rate
 */
export async function createTaxRateAction(input: CreateTaxRateInput): Promise<TaxRateActionResult> {
  try {
    const taxRate = await taxRateService.create(input);

    revalidatePath("/tax-rates");

    return {
      success: true,
      data: {
        id: taxRate.id,
        name: taxRate.name,
        percentage: Number(taxRate.percentage),
        applicability: taxRate.applicability,
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
    console.error("Error creating tax rate:", error);
    return {
      success: false,
      error: "Failed to create tax rate. Please try again.",
    };
  }
}

/**
 * Update an existing tax rate
 */
export async function updateTaxRateAction(input: UpdateTaxRateInput): Promise<TaxRateActionResult> {
  try {
    const taxRate = await taxRateService.update(input);

    revalidatePath("/tax-rates");

    return {
      success: true,
      data: {
        id: taxRate.id,
        name: taxRate.name,
        percentage: Number(taxRate.percentage),
        applicability: taxRate.applicability,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Tax rate not found",
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
    console.error("Error updating tax rate:", error);
    return {
      success: false,
      error: "Failed to update tax rate. Please try again.",
    };
  }
}

/**
 * Delete a tax rate (only if not in use)
 */
export async function deleteTaxRateAction(id: string): Promise<TaxRateActionResult> {
  try {
    await taxRateService.delete(id);

    revalidatePath("/tax-rates");

    return {
      success: true,
      data: { message: "Tax rate deleted successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Tax rate not found",
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error deleting tax rate:", error);
    return {
      success: false,
      error: "Failed to delete tax rate. Please try again.",
    };
  }
}
