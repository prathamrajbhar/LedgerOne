import { NextRequest, NextResponse } from "next/server";
import { helpAssistantService } from "@/lib/services/help-assistant.service";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array" },
        { status: 400 }
      );
    }

    const reply = await helpAssistantService.chat({ messages });
    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
