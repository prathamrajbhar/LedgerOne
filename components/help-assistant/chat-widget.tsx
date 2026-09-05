"use client";

import * as React from "react";
import { useState } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialSuggestions = [
  "How do I record a new furniture sale invoice?",
  "How do I track low stock for dining chairs?",
  "What is the difference between Customer & Vendor contact?",
  "How to record a GST vendor bill payment?",
];

export function HelpAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/help-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      // Fallback friendly offline assistant response
      let fallbackReply = "I can guide you through LedgerOne accounting workflows! ";
      const lower = text.toLowerCase();
      if (lower.includes("invoice") || lower.includes("sale")) {
        fallbackReply =
          "To create a Customer Invoice: Navigate to Invoices in the sidebar, click '+ New Invoice', select your customer (e.g. Modern Living Interiors), add furniture line items, review GST amounts, and click 'Confirm'.";
      } else if (lower.includes("stock") || lower.includes("product") || lower.includes("chair")) {
        fallbackReply =
          "In Products & Inventory: You can check current stock counts, set reorder levels, and view items in 'Low Stock' (amber badge) or 'Out of Stock' (red badge). Click '+ New Product' to register new furniture items.";
      } else if (lower.includes("payment") || lower.includes("bill")) {
        fallbackReply =
          "To record a Payment: Open the Invoice or Vendor Bill, click 'Record Payment', choose the bank/cash account (e.g., HDFC Bank Current), enter the received amount, and post the entry.";
      } else {
        fallbackReply =
          "LedgerOne handles double-entry bookkeeping, furniture stock management, GST invoicing, and financial reports. You can ask me how to perform any specific action in the app!";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-lg hover:bg-navy-hover transition-all hover:scale-105 active:scale-95 group border-2 border-white/80"
        aria-label="Open Help Assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">Help Assistant</span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] flex flex-col shadow-2xl border border-border bg-white rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy text-white">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-teal/30 text-teal-light">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold leading-tight">LedgerOne Assistant</h3>
            <p className="text-[10px] text-white/70">Accounting & ERP Guide</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F9FAFB]">
        {messages.length === 0 && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-white border border-border text-xs text-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-navy">
                <Sparkles className="h-3.5 w-3.5 text-teal" />
                <span>Hello, Rohan!</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m your LedgerOne accounting assistant. Ask me anything about managing your furniture business, invoices, payments, or reports.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Common Inquiries
              </span>
              <div className="flex flex-col gap-1.5">
                {initialSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item)}
                    className="text-left text-xs p-2 rounded-lg bg-white border border-border hover:border-teal/40 hover:bg-[#E8F0F7]/40 text-foreground transition-all flex items-start gap-2"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-navy text-white rounded-br-none shadow-xs"
                  : "bg-white text-foreground border border-border rounded-bl-none shadow-xs"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-teal animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-2 h-2 rounded-full bg-teal animate-bounce [animation-delay:0.4s]" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-2.5 border-t border-border bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-1.5"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="h-9 text-xs"
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !input.trim()}
            className="h-9 w-9 p-0 flex-shrink-0 bg-navy hover:bg-navy-hover"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
