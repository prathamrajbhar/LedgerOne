import { NextRequest, NextResponse } from "next/server";
import { helpAssistant, ChatMessage, AuthContext } from "@/lib/chatbot/help-assistant";
import { auth } from "@/lib/auth/auth.config";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. Session & Auth check: Reject unauthenticated callers
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to consult LedgerOne AI Assistant." },
        { status: 401 }
      );
    }

    const { messages } = await request.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Extract last user message
    const lastUserMessage = messages[messages.length - 1];

    if (!lastUserMessage?.content || lastUserMessage.role !== "user") {
      return NextResponse.json(
        { error: "Invalid request: last message must be from user" },
        { status: 400 }
      );
    }

    // Extract conversation history (all messages except the last one)
    const conversationHistory: ChatMessage[] = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Construct caller security & RBAC context
    const authContext: AuthContext = {
      role: session.user.role as UserRole,
      contactId: session.user.contactId,
      name: session.user.name || undefined,
    };

    // Call the help assistant with real LLM and security context
    const reply = await helpAssistant.ask(
      lastUserMessage.content,
      conversationHistory,
      authContext
    );

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Help assistant API error:", error);

    // Handle specific error messages from the help assistant
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { error: "Help Assistant is not configured. Please contact support." },
          { status: 503 }
        );
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "Help Assistant is temporarily unavailable. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
