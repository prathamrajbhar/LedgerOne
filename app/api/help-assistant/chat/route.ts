import { NextRequest, NextResponse } from "next/server";
import { helpAssistant, ChatMessage } from "@/lib/chatbot/help-assistant";

export async function POST(request: NextRequest) {
  try {
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

    // Call the help assistant with real LLM
    const reply = await helpAssistant.ask(
      lastUserMessage.content,
      conversationHistory
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
