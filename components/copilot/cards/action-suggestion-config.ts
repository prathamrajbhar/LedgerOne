export interface SuggestionConfig {
  navPath: string;
  navLabel: string;
  prompts: string[];
}

export function getSuggestionConfig(
  toolName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>
): SuggestionConfig {
  const contactName = String(input.name || input.customerName || input.vendorName || input.contactNameOrEmail || "");
  const docNum = String(output.invoiceNumber || output.billNumber || output.orderNumber || input.documentNumber || input.orderNumber || input.invoiceId || "");

  if (toolName === "createStaffUserAction") {
    return {
      navPath: "/users",
      navLabel: "Open User & Access Management",
      prompts: ["List all active staff users", "Invite client to portal"],
    };
  }

  if (toolName === "inviteContactToPortalAction") {
    return {
      navPath: "/users",
      navLabel: "Open User & Access Management",
      prompts: ["Show all portal users", "Create staff account"],
    };
  }

  if (toolName === "toggleUserStatusAction" || toolName === "updateUserRoleAction") {
    return {
      navPath: "/users",
      navLabel: "Open User & Access Management",
      prompts: ["List all system users", "Show admin users"],
    };
  }

  if (toolName === "createContactAction") {
    const isVendor = String(input.type).toUpperCase() === "VENDOR";
    return {
      navPath: "/contacts",
      navLabel: "Open Contacts Directory",
      prompts: isVendor
        ? [`Create purchase order for ${contactName}`, `Create vendor bill for ${contactName}`]
        : [`Create sales order for ${contactName}`, `Create draft invoice for ${contactName}`, `Invite ${contactName} to portal`],
    };
  }

  if (toolName === "createCustomerInvoiceDraftAction" || toolName === "convertSalesOrderToInvoiceAction") {
    return {
      navPath: "/invoices",
      navLabel: "Open Invoices",
      prompts: [
        docNum ? `Get PDF for invoice ${docNum}` : "Get PDF for latest invoice",
        docNum ? `Record payment for ${docNum}` : "Record payment for this invoice",
      ],
    };
  }

  if (toolName === "createVendorBillDraftAction" || toolName === "convertPurchaseOrderToBillAction") {
    return {
      navPath: "/bills",
      navLabel: "Open Vendor Bills",
      prompts: ["View Accounts Payable balance", "Record payment for this bill"],
    };
  }

  if (toolName === "createSalesOrderAction" || toolName === "confirmSalesOrderAction") {
    return {
      navPath: "/sales-orders",
      navLabel: "Open Sales Orders",
      prompts: [docNum ? `Convert ${docNum} to invoice` : "Convert to customer invoice", "View all sales orders"],
    };
  }

  if (toolName === "createPurchaseOrderAction" || toolName === "confirmPurchaseOrderAction") {
    return {
      navPath: "/purchase-orders",
      navLabel: "Open Purchase Orders",
      prompts: [docNum ? `Convert ${docNum} to vendor bill` : "Convert to vendor bill"],
    };
  }

  if (toolName === "createProductAction") {
    return {
      navPath: "/products",
      navLabel: "Open Product Catalog",
      prompts: [`Adjust stock for ${String(input.name || "item")}`, `Create sales quote with ${String(input.name || "item")}`],
    };
  }

  if (toolName === "adjustStockAction") {
    return {
      navPath: "/products",
      navLabel: "Open Products",
      prompts: ["Get inventory valuation", "View Financial KPIs"],
    };
  }

  if (toolName === "recordPaymentAction") {
    return {
      navPath: "/accounts",
      navLabel: "Open Chart of Accounts",
      prompts: ["Get live account balances", "View financial KPIs summary"],
    };
  }

  return {
    navPath: "/dashboard",
    navLabel: "Go to Dashboard",
    prompts: ["Summarize financial KPIs", "Show pending bills and invoices"],
  };
}
