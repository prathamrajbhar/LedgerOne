import { Decimal } from "@prisma/client/runtime/library";

// Utility type for service responses
export type ServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Common pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Money utilities
export const DECIMAL_PRECISION = 2;

export function calculateLineTotal(quantity: Decimal, unitPrice: Decimal): Decimal {
  return quantity.mul(unitPrice);
}

export function calculateTaxAmount(lineTotal: Decimal, taxPercentage: Decimal): Decimal {
  return lineTotal.mul(taxPercentage).div(100);
}

export function roundMoney(amount: Decimal): Decimal {
  return amount.toDecimalPlaces(DECIMAL_PRECISION);
}

export function formatMoney(amount: Decimal, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount.toNumber());
}

// Date utilities
export function isWithinPeriod(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}
