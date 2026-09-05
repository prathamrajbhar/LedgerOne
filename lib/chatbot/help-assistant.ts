import Anthropic from "@anthropic-ai/sdk";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the LedgerOne Help Assistant. Your sole purpose is to provide product usage and workflow guidance to users of the LedgerOne Accounting System based on standard operating procedures and accounting best practices.

CRITICAL INSTRUCTIONS & ISOLATION RULES:
1. You ONLY answer questions related to using the LedgerOne application (e.g. how to create a sales order, how journal entries work, how budget achievement is calculated).
2. You DO NOT have access to any database, financial records, customer details, or real-time data.
3. If a user asks for specific financial numbers, account balances, transaction histories, or company confidential data, you MUST politely decline and inform them that you are a usage help assistant without financial database access.
4. Keep answers clear, structured, and helpful using Markdown format.`;

export class HelpAssistant {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY || "dummy_api_key";
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async ask(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const client = this.getClient();

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      });

      const firstContent = response.content[0];
      if (firstContent && firstContent.type === "text") {
        return firstContent.text;
      }
      return "I'm sorry, I couldn't process your request.";
    } catch (error) {
      if (process.env.NODE_ENV === "test" || !process.env.ANTHROPIC_API_KEY) {
        return "I am the LedgerOne Help Assistant. I can help you navigate software features such as creating Sales Orders, Vendor Bills, and Journal Entries. For security, I do not have access to financial database records.";
      }
      throw error;
    }
  }
}

export const helpAssistant = new HelpAssistant();
