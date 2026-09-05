import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const lastUserMessage = messages?.[messages.length - 1]?.content || "";

    const lower = lastUserMessage.toLowerCase();
    let reply = "LedgerOne provides comprehensive ERP and double-entry accounting for your furniture business.";

    if (lower.includes("invoice") || lower.includes("sales")) {
      reply =
        "To create a Customer Invoice: Go to Invoices in the sidebar, click '+ New Invoice', select the customer, add furniture items (like Dining Tables or Sofas), and verify the GST calculation. Once confirmed, it posts automatically to your general ledger.";
    } else if (lower.includes("stock") || lower.includes("inventory") || lower.includes("product")) {
      reply =
        "Inventory Status tracks furniture units across In Stock (green), Low Stock (amber), and Out of Stock (red). When stock reaches the reorder threshold, LedgerOne alerts you in the dashboard.";
    } else if (lower.includes("expense") || lower.includes("bill")) {
      reply =
        "To record an Expense or Vendor Bill: Go to Expenses or Purchases, select the vendor (e.g. Timber / Hardware supplier), enter line items and taxes, and attach the receipt.";
    } else if (lower.includes("account") || lower.includes("journal")) {
      reply =
        "Chart of Accounts organizes your Assets, Liabilities, Equity, Income, and Expenses. Every posted transaction adheres strictly to double-entry rules where Debit must equal Credit.";
    } else {
      reply =
        "I'm here to help you navigate LedgerOne! You can ask about managing contacts, raising invoices, stock tracking, or viewing your P&L and Balance Sheet reports.";
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Help assistant API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
