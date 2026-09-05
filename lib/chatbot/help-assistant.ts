import { GoogleGenerativeAI, Content } from "@google/generative-ai";

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
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY must be configured to use Help Assistant"
        );
      }

      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  async ask(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const client = this.getClient();

    // Convert conversation history to Gemini format
    const history: Content[] = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    try {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const chat = model.startChat({
        history,
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return text;
    } catch (error) {
      console.error("Gemini API error:", error);

      if (error instanceof Error) {
        // Handle specific API errors
        if (error.message.includes("API key")) {
          throw new Error("Invalid or missing Gemini API key. Please check your configuration.");
        }
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          throw new Error("API rate limit exceeded. Please try again later.");
        }
      }

      throw new Error("Failed to get response from Help Assistant. Please try again.");
    }
  }
}

export const helpAssistant = new HelpAssistant();
