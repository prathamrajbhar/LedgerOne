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
        description: z.string().describe("Description of the expense (e.g. 'Office Supplies')"),
        amount: z.number().min(1).describe("Expense amount in INR"),
        category: z.string().default("General Expense"),
      }),
    }),

    // 6. Record Payment (Inbound or Outbound)
    recordPaymentAction: tool({
      description: "Propose recording a payment for an invoice (inbound) or vendor bill (outbound). Updates status and ledger entries. Requires interactive user approval.",
      inputSchema: z.object({
        documentNumber: z.string().describe("Invoice Number (e.g. 'INV-2026-4009') or Bill Number (e.g. 'BILL-2026-2001')"),
        amount: z.number().min(0.01).describe("Payment amount in INR"),
        paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI"]).default("BANK_TRANSFER"),
        note: z.string().optional().describe("Optional payment reference or note"),
      }),
    }),

    // 7. Sales Order Lifecycle
    createSalesOrderAction: tool({
      description: "Propose creating a new Quotation / Sales Order. Requires interactive user approval.",
      inputSchema: z.object({
        customerName: z.string().describe("Customer name"),
        productName: z.string().describe("Product name"),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0).describe("Unit price"),
      }),
    }),

    confirmSalesOrderAction: tool({
      description: "Propose confirming a Sales Order from DRAFT to CONFIRMED. Requires interactive user approval.",
      inputSchema: z.object({
        orderNumber: z.string().describe("Sales Order number (e.g. 'SO-2026-0001') or ID"),
      }),
    }),

    convertSalesOrderToInvoiceAction: tool({
      description: "Propose converting a confirmed Sales Order into a Customer Invoice. Requires interactive user approval.",
      inputSchema: z.object({
        orderNumber: z.string().describe("Sales Order number or ID to convert"),
      }),
    }),

    // 8. Purchase Order Lifecycle
    createPurchaseOrderAction: tool({
      description: "Propose creating a new Purchase Order / RFQ. Requires interactive user approval.",
      inputSchema: z.object({
        vendorName: z.string().describe("Vendor name"),
        productName: z.string().describe("Product name"),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0).describe("Cost per unit"),
      }),
    }),

    confirmPurchaseOrderAction: tool({
      description: "Propose confirming a Purchase Order from DRAFT to CONFIRMED. Requires interactive user approval.",
      inputSchema: z.object({
        orderNumber: z.string().describe("Purchase Order number (e.g. 'PO-2026-0001') or ID"),
      }),
    }),

    convertPurchaseOrderToBillAction: tool({
      description: "Propose converting a confirmed Purchase Order into a Vendor Bill. Requires interactive user approval.",
      inputSchema: z.object({
        orderNumber: z.string().describe("Purchase Order number or ID to convert"),
      }),
    }),

    // 9. Catalog & Stock Adjustments
    createProductAction: tool({
      description: "Propose creating a new Product in the catalog. Requires interactive user approval.",
      inputSchema: z.object({
        name: z.string().min(2).describe("Product name"),
        salesPrice: z.number().min(0).describe("Selling price"),
        cost: z.number().min(0).describe("Cost price"),
        initialStock: z.number().min(0).default(0),
        sku: z.string().optional(),
      }),
    }),

    adjustStockAction: tool({
      description: "Propose adjusting inventory stock for a product. Requires interactive user approval.",
      inputSchema: z.object({
        productNameOrSku: z.string().describe("Product name or SKU"),
        newStockQuantity: z.number().min(0).describe("New physical stock count"),
        reason: z.string().optional().describe("Reason for adjustment (e.g. 'Physical inventory audit')"),
      }),
    }),

    // 10. User & Access Management
    createStaffUserAction: tool({
      description: "Propose creating a new internal staff user account (Administrator or Accountant) with login credentials. Requires interactive user approval.",
      inputSchema: z.object({
        name: z.string().min(2).describe("Staff member full name"),
        email: z.string().email().describe("Work email address"),
        role: z.enum(["ADMINISTRATOR", "ACCOUNTANT"]).default("ACCOUNTANT").describe("Access role: ADMINISTRATOR or ACCOUNTANT"),
        loginId: z.string().optional().describe("Optional custom login ID (6-12 chars)"),
        initialPassword: z.string().optional().describe("Optional custom password (min 8 chars, mixed case, special char)"),
      }),
    }),

    inviteContactToPortalAction: tool({
      description: "Propose inviting an existing Customer or Vendor to the Client/Vendor Portal, creating login credentials and dispatching invitation. Requires interactive user approval.",
      inputSchema: z.object({
        contactNameOrEmail: z.string().describe("Name, email, or ID of the customer or vendor to invite"),
      }),
    }),

    toggleUserStatusAction: tool({
      description: "Propose activating or deactivating a system user account in LedgerOne. Requires interactive user approval.",
      inputSchema: z.object({
        userIdentifier: z.string().describe("User email, Login ID, or User ID"),
        isActive: z.boolean().describe("true to activate account, false to deactivate"),
      }),
    }),

    updateUserRoleAction: tool({
      description: "Propose changing the system access role of an internal staff member. Requires interactive user approval.",
      inputSchema: z.object({
        userIdentifier: z.string().describe("User email, Login ID, or User ID"),
        newRole: z.enum(["ADMINISTRATOR", "ACCOUNTANT"]).describe("New role to assign"),
      }),
    }),

    // 11. Client Navigation
    navigateTo: tool({
      description: "Navigate the user directly to an ERP page, report, invoice, customer, or settings screen.",
      inputSchema: z.object({
        path: z.string().describe("Internal route path (e.g., '/users', '/invoices', '/bills', '/reports/profit-loss')"),
        label: z.string().describe("Human readable title of destination"),
        description: z.string().optional(),
      }),
    }),
  };
}
