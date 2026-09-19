export interface CopilotUserContext {
  userId: string;
  name?: string | null;
  email: string;
  role: string;
}

export type PlatformCategory =
  | "BILLS"
  | "INVOICES"
  | "SALES_ORDERS"
  | "PURCHASE_ORDERS"
  | "EXPENSES"
  | "PRODUCTS"
  | "CONTACTS"
  | "BUDGETS";
