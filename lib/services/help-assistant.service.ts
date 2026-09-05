/**
 * Help Assistant Service
 * FAQ-based chatbot for product usage guidance.
 * ISOLATED: Never accesses Prisma or financial database directly.
 */

const FAQ_KNOWLEDGE_BASE: Record<string, string> = {
  purchase:
    "To create a Purchase Order, go to Purchase > Orders and click 'New Purchase Order'. Once verified, you can generate a Vendor Bill from the Purchase Order and record manual payments against it.",
  sales:
    "To record sales, create a Sales Order under Sales > Orders. When confirmed, generate a Customer Invoice under Sales > Invoices. Customers can pay via the Portal using Razorpay, or you can record payment manually.",
  budget:
    "Budgets are created under Budgets. After adding planned line items for analytic accounts, click 'Confirm' to begin tracking real-time achievement percentages against confirmed invoices and bills.",
  journal:
    "Journal Entries can be created manually under Accounting > Journal Entries. Note that total debits must exactly equal total credits before posting. Auto-generated entries are created when invoices and bills are confirmed or paid.",
  balance:
    "The Balance Sheet report is available under Reports > Balance Sheet. It categorizes leaf accounts under Assets, Liabilities, and Equity.",
  portal:
    "The Customer Portal allows contacts to view their specific invoices and make online payments securely via Razorpay.",
  settings:
    "Company settings, document numbering prefixes (PO, BILL, SO, INV, JE), and default currencies can be configured under Settings by an Administrator.",
};

export class HelpAssistantService {
  async chat({
    messages,
  }: {
    messages: { role: string; content: string }[];
  }): Promise<string> {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content.toLowerCase() || "";

    for (const [key, answer] of Object.entries(FAQ_KNOWLEDGE_BASE)) {
      if (lastUserMessage.includes(key)) {
        return answer;
      }
    }

    if (
      lastUserMessage.includes("help") ||
      lastUserMessage.includes("how") ||
      lastUserMessage.includes("what")
    ) {
      return "LedgerOne supports the complete small business accounting cycle: Purchase Orders, Vendor Bills, Sales Orders, Customer Invoices, Double-entry Journal Entries, Analytical Budgets, and Financial Reports (Balance Sheet, P&L). How can I guide you?";
    }

    return "You can navigate through LedgerOne using the sidebar. Need help with Purchase, Sales, Accounting, Budgets, or Reports?";
  }
}

export const helpAssistantService = new HelpAssistantService();
