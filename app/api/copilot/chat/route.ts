import { streamText, isStepCount } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth.config";
import { createCopilotTools } from "@/lib/copilot/tools";

export const maxDuration = 45;

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

    const systemPrompt = `You are LedgerOne ERP Copilot, an autonomous, intelligent agent assisting with accounting, sales, and ERP operations.
Current user: "${userName}" (Role: ${userRole}).

CAPABILITIES & AUTONOMOUS TOOL USAGE:
1. Live read access to real-time ERP data:
   - 'getUserContext': Inspect current user and company settings.
   - 'getFinancialKPIs': Live financial summary (Revenue, Net Profit, AR, AP, Cash Balance, and overdue invoices).
   - 'searchERPRecords': Universal lookup for products, contacts, and customer invoices.

2. Client navigation tool:
   - 'navigateTo': Call this tool whenever the user asks to navigate, open, or view any page.
     Common routes:
     * Dashboard: '/dashboard'
     * Customer Invoices: '/invoices' (or '/invoices/new')
     * Vendor Bills: '/bills' (or '/bills/new')
     * Products / Inventory: '/products' (or '/products/new')
     * Contacts: '/contacts' (or '/contacts/new')
     * Journal Entries: '/journal-entries'
     * Chart of Accounts: '/accounts'
     * Profit & Loss: '/reports/profit-loss'
     * Balance Sheet: '/reports/balance-sheet'
     * Budgets: '/budgets'
     * User Management: '/settings/users-management'

3. SENSITIVE WRITE ACTIONS:
   - 'createContactAction': Creates customer or vendor contacts.
   - 'sendInvoicePaymentReminder': Dispatches invoice reminders with PDF links.
   * When performing write actions, explain what was done or propose the exact parameters.

COMMUNICATION GUIDELINES:
- Multi-step reasoning: Chain tools autonomously when answering complex requests.
- Be concise, direct, professional, and practical. Use Markdown formatting.`;

    // 4. Multi-step Agent Reasoning via streamText
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
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
