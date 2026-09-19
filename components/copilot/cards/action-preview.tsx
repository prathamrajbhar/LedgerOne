"use client";

import * as React from "react";

interface ActionPreviewProps {
  toolName: string;
  input: Record<string, unknown>;
}

export function ActionPreview({ toolName, input }: ActionPreviewProps) {
  if (toolName === "createContactAction") {
    return (
      <>
        <p><strong>Action:</strong> Create new {String(input.type || "Contact").toLowerCase()}</p>
        <p><strong>Name:</strong> {String(input.name || "")}</p>
        <p><strong>Email:</strong> {String(input.email || "")}</p>
        {Boolean(input.phone) && <p><strong>Phone:</strong> {String(input.phone)}</p>}
      </>
    );
  }

  if (toolName === "sendInvoicePaymentReminder") {
    return (
      <>
        <p><strong>Action:</strong> Dispatch email payment reminder with invoice PDF</p>
        <p><strong>Invoice:</strong> {String(input.invoiceId || "")}</p>
        {Boolean(input.customNote) && <p><strong>Note:</strong> {String(input.customNote)}</p>}
      </>
    );
  }

  if (toolName === "createCustomerInvoiceDraftAction") {
    return (
      <>
        <p><strong>Action:</strong> Create draft Customer Invoice</p>
        <p><strong>Customer:</strong> {String(input.customerName || "")}</p>
        <p><strong>Item:</strong> {String(input.productName || "")} (Qty: {String(input.quantity || 1)} @ ₹{Number(input.unitPrice || 0).toLocaleString("en-IN")})</p>
      </>
    );
  }

  if (toolName === "createVendorBillDraftAction") {
    return (
      <>
        <p><strong>Action:</strong> Create draft Vendor Bill</p>
        <p><strong>Vendor:</strong> {String(input.vendorName || "")}</p>
        <p><strong>Item:</strong> {String(input.productName || "")} (Qty: {String(input.quantity || 1)} @ ₹{Number(input.unitPrice || 0).toLocaleString("en-IN")})</p>
      </>
    );
  }

  if (toolName === "recordExpenseAction") {
    return (
      <>
        <p><strong>Action:</strong> Record Operational Expense</p>
        <p><strong>Description:</strong> {String(input.description || "")}</p>
        <p><strong>Amount:</strong> ₹{Number(input.amount || 0).toLocaleString("en-IN")}</p>
      </>
    );
  }

  if (toolName === "recordPaymentAction") {
    return (
      <>
        <p><strong>Action:</strong> Record Payment Receipt / Bill Payment</p>
        <p><strong>Document:</strong> {String(input.documentNumber || "")}</p>
        <p><strong>Amount:</strong> ₹{Number(input.amount || 0).toLocaleString("en-IN")}</p>
        <p><strong>Method:</strong> {String(input.paymentMethod || "BANK_TRANSFER")}</p>
      </>
    );
  }

  if (toolName === "createSalesOrderAction") {
    return (
      <>
        <p><strong>Action:</strong> Create Sales Quotation / Order</p>
        <p><strong>Customer:</strong> {String(input.customerName || "")}</p>
        <p><strong>Item:</strong> {String(input.productName || "")} (Qty: {String(input.quantity || 1)} @ ₹{Number(input.unitPrice || 0).toLocaleString("en-IN")})</p>
      </>
    );
  }

  if (toolName === "confirmSalesOrderAction") {
    return (
      <>
        <p><strong>Action:</strong> Confirm Sales Order</p>
        <p><strong>Order:</strong> {String(input.orderNumber || "")}</p>
      </>
    );
  }

  if (toolName === "convertSalesOrderToInvoiceAction") {
    return (
      <>
        <p><strong>Action:</strong> Convert Sales Order to Customer Invoice</p>
        <p><strong>Order:</strong> {String(input.orderNumber || "")}</p>
      </>
    );
  }

  if (toolName === "createPurchaseOrderAction") {
    return (
      <>
        <p><strong>Action:</strong> Create Purchase Order (RFQ)</p>
        <p><strong>Vendor:</strong> {String(input.vendorName || "")}</p>
        <p><strong>Item:</strong> {String(input.productName || "")} (Qty: {String(input.quantity || 1)} @ ₹{Number(input.unitPrice || 0).toLocaleString("en-IN")})</p>
      </>
    );
  }

  if (toolName === "confirmPurchaseOrderAction") {
    return (
      <>
        <p><strong>Action:</strong> Confirm Purchase Order</p>
        <p><strong>Order:</strong> {String(input.orderNumber || "")}</p>
      </>
    );
  }

  if (toolName === "convertPurchaseOrderToBillAction") {
    return (
      <>
        <p><strong>Action:</strong> Convert Purchase Order to Vendor Bill</p>
        <p><strong>Order:</strong> {String(input.orderNumber || "")}</p>
      </>
    );
  }

  if (toolName === "createProductAction") {
    return (
      <>
        <p><strong>Action:</strong> Create Catalog Product</p>
        <p><strong>Name:</strong> {String(input.name || "")}</p>
        <p><strong>Sales Price:</strong> ₹{Number(input.salesPrice || 0).toLocaleString("en-IN")}</p>
        <p><strong>Cost:</strong> ₹{Number(input.cost || 0).toLocaleString("en-IN")}</p>
      </>
    );
  }

  if (toolName === "adjustStockAction") {
    return (
      <>
        <p><strong>Action:</strong> Adjust Physical Inventory Stock</p>
        <p><strong>Product / SKU:</strong> {String(input.productNameOrSku || "")}</p>
        <p><strong>New Quantity:</strong> {String(input.newStockQuantity ?? 0)} units</p>
        {Boolean(input.reason) && <p><strong>Reason:</strong> {String(input.reason)}</p>}
      </>
    );
  }

  if (toolName === "createStaffUserAction") {
    return (
      <>
        <p><strong>Action:</strong> Create Staff Account</p>
        <p><strong>Name:</strong> {String(input.name || "")}</p>
        <p><strong>Email:</strong> {String(input.email || "")}</p>
        <p><strong>Role:</strong> {String(input.role || "ACCOUNTANT")}</p>
      </>
    );
  }

  if (toolName === "inviteContactToPortalAction") {
    return (
      <>
        <p><strong>Action:</strong> Invite Contact to Portal</p>
        <p><strong>Contact:</strong> {String(input.contactNameOrEmail || "")}</p>
        <p><strong>Access:</strong> Client/Vendor Portal Credentials</p>
      </>
    );
  }

  if (toolName === "toggleUserStatusAction") {
    return (
      <>
        <p><strong>Action:</strong> {input.isActive ? "Activate" : "Deactivate"} User Account</p>
        <p><strong>User:</strong> {String(input.userIdentifier || "")}</p>
      </>
    );
  }

  if (toolName === "updateUserRoleAction") {
    return (
      <>
        <p><strong>Action:</strong> Change User Access Role</p>
        <p><strong>User:</strong> {String(input.userIdentifier || "")}</p>
        <p><strong>New Role:</strong> {String(input.newRole || "")}</p>
      </>
    );
  }

  return <p><strong>Action:</strong> Execute {toolName}</p>;
}
