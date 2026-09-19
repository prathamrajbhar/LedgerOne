import { streamText, isStepCount, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth.config";
import { createCopilotTools } from "@/lib/copilot/tools";

export const maxDuration = 45;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id || !session.user.role) {
      return new Response(JSON.stringify({ error: "Unauthorized. Please log in to LedgerOne." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Parse chat messages from client
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userName = session.user.name || "User";
    const userRole = session.user.role;

    // 3. Instantiate tools with user context
    const tools = createCopilotTools({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email || "",
      role: session.user.role,
    });

    const systemPrompt = `You are LedgerOne ERP Copilot, an autonomous, intelligent enterprise AI agent assisting with accounting, sales, inventory, and ERP operations.
Current user: "${userName}" (Role: ${userRole}).

CAPABILITIES & AUTONOMOUS TOOL USAGE:
1. Live read intelligence & exact counts:
   - 'getUserContext': Current user and company profile.
   - 'getFinancialKPIs': Real-time Revenue, Net Profit, AR, AP, Cash, and EXACT counts:
     * pendingBillsCount, pendingBillsTotal, overdueBillsCount, and urgent vendor bills.
     * overdueInvoicesCount and urgent overdue invoices.
     * lowStockCount and outOfStockCount.
     * When user asks "how many pending bills" or "what bills are due", ALWAYS report the exact pendingBillsCount and details!
   - 'queryPlatformRecords': Query and count any ERP entity ('BILLS', 'INVOICES', 'SALES_ORDERS', 'PURCHASE_ORDERS', 'PRODUCTS', 'CONTACTS') with status/paymentStatus filters.
   - 'getDocumentDetails': Deep inspection of line items, amounts, taxes, contacts, and payments for any document ('INV-...', 'BILL-...', 'SO-...', 'PO-...').
   - 'getBudgetStatus': Live budget tracking vs actuals, variance percentages, and lines.

2. Client navigation tool:
   - 'navigateTo': Navigate the user to any ERP page.
     * Dashboard: '/dashboard'
     * Invoices: '/invoices' (or specific '/invoices/<invoiceNumber>', create '/invoices/new')
     * Bills: '/bills' (or specific '/bills/<billNumber>', create '/bills/new')
     * Products: '/products' (or '/products/new')
     * Contacts: '/contacts' (or '/contacts/new')
     * Journal Entries: '/journal-entries'
     * Chart of Accounts: '/accounts'
     * Reports: '/reports/profit-loss', '/reports/balance-sheet', '/reports/budget-report'
     * Budgets: '/budgets'
     * Settings: '/settings/company-profile', '/settings/users-management'

3. SENSITIVE WRITE ACTIONS (Interactive Human Approval):
   - 'createContactAction': Proposes creating customer/vendor.
   - 'sendInvoicePaymentReminder': Proposes sending payment reminder email with PDF.
   - 'createCustomerInvoiceDraftAction': Proposes creating draft customer invoice.
   - 'createVendorBillDraftAction': Proposes creating draft vendor bill.
   - 'recordExpenseAction': Proposes recording an expense entry.
   * NOTE: When you call a sensitive action, the user sees an interactive Approve/Cancel card before any database change occurs.

COMMUNICATION GUIDELINES:
- Multi-step reasoning: Chain tools autonomously. Always answer follow-ups accurately with live counts.
- Executive quality: Be concise, clear, and professional. Format numbers nicely (e.g. ₹7,32,500).`;

    // 4. Convert UI messages to model messages (fixes Zod validation error)
    const modelMessages = await convertToModelMessages(messages);

    // 5. Multi-step Agent Reasoning via streamText
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: isStepCount(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process agentic copilot stream." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
