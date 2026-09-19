import { tool } from "ai";
import { z } from "zod";

export function createCopilotActionTools() {
  return {
    // 1. Contact Creation
    createContactAction: tool({
      description: "Propose creating a new Customer or Vendor contact in LedgerOne. Requires interactive user approval.",
      inputSchema: z.object({
        name: z.string().min(2).describe("Full name or company name"),
        email: z.string().email().describe("Contact email"),
        type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]),
        phone: z.string().optional(),
        city: z.string().optional(),
      }),
    }),

    // 2. Overdue Invoice Reminder
    sendInvoicePaymentReminder: tool({
      description: "Propose sending an official payment reminder email with PDF details to the customer. Requires interactive user approval.",
      inputSchema: z.object({
        invoiceId: z.string().describe("Invoice ID or Invoice Number (e.g. 'INV-2026-4009')"),
        customNote: z.string().optional().describe("Optional friendly reminder message"),
      }),
    }),

    // 3. Draft Customer Invoice Creation
    createCustomerInvoiceDraftAction: tool({
      description: "Propose creating a draft customer invoice. Requires interactive user approval.",
      inputSchema: z.object({
        customerName: z.string().describe("Name of the customer"),
        productName: z.string().describe("Product or service being billed"),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0).describe("Price per unit"),
        dueDateDays: z.number().default(30).describe("Due date in days from today"),
      }),
    }),

    // 4. Draft Vendor Bill Creation
    createVendorBillDraftAction: tool({
      description: "Propose creating a draft vendor bill. Requires interactive user approval.",
      inputSchema: z.object({
        vendorName: z.string().describe("Name of the vendor/supplier"),
        productName: z.string().describe("Product or service purchased"),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0).describe("Cost per unit"),
        dueDateDays: z.number().default(30).describe("Due date in days from today"),
      }),
    }),

    // 5. Operational Expense Recording
    recordExpenseAction: tool({
      description: "Propose recording an operational expense entry. Requires interactive user approval.",
      inputSchema: z.object({
        description: z.string().describe("Description of the expense (e.g. 'Office Supplies', 'Client Dinner')"),
        amount: z.number().min(1).describe("Expense amount in INR"),
        category: z.string().default("General Expense"),
      }),
    }),

    // 6. Client Navigation
    navigateTo: tool({
      description: "Navigate the user directly to an ERP page, report, invoice, customer, or settings screen. For invoices, use '/invoices/<invoiceNumber>' or '/invoices/<id>'. For bills, use '/bills/<billNumber>' or '/bills/<id>'.",
      inputSchema: z.object({
        path: z.string().describe("The internal route path (e.g., '/invoices', '/invoices/INV-2026-4009', '/bills', '/reports/profit-loss')"),
        label: z.string().describe("Human readable title of the destination page"),
        description: z.string().optional(),
      }),
    }),
  };
}
