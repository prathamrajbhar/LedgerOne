"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  HelpCircle,
  Database,
  RefreshCw,
  Box,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  ArrowRight,
  Bot,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RobotIcon } from "./robot-icon";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const workspaceSuggestions = [
  {
    icon: Box,
    text: "How many products do we have in stock?",
  },
  {
    icon: AlertTriangle,
    text: "Which items are currently low on stock?",
  },
  {
    icon: Users,
    text: "How many customers and vendors are registered?",
  },
  {
    icon: TrendingUp,
    text: "Show overall total revenue & net profit",
  },
];

const contactSuggestions = [
  {
    icon: FileText,
    text: "What is my outstanding invoice balance?",
  },
  {
    icon: Box,
    text: "How many products do we have in stock?",
  },
  {
    icon: AlertTriangle,
    text: "Show my recent invoices and due dates",
  },
];

function FormattedMessage({
  content,
  onQuestionClick,
}: {
  content: string;
  onQuestionClick?: (text: string) => void;
}) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1 text-xs leading-relaxed text-slate-800">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-0.5" />;

        if (trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
          const title = trimmed.replace(/^#{3,4}\s+/, "");
          return (
            <h4 key={lineIdx} className="font-bold text-navy text-xs mt-1.5 mb-1 border-b border-slate-200 pb-0.5">
              {parseInlineFormatting(title)}
            </h4>
          );
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.substring(2);

          const quoteMatch = itemText.match(/['"’‘]([^'"’‘]+)['"’‘]/);
          const isQuestionText = quoteMatch
            ? quoteMatch[1]
            : itemText.includes("?") && !itemText.toLowerCase().includes("http")
            ? itemText.replace(/\*\*/g, "").trim()
            : null;

          if (isQuestionText && onQuestionClick) {
            const cleanQuestion = isQuestionText.trim();
            return (
              <button
                key={lineIdx}
                type="button"
                onClick={() => onQuestionClick(cleanQuestion)}
                className="w-full text-left text-[11px] p-2 my-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-navy transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <HelpCircle className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                  <span className="font-medium truncate">{cleanQuestion}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-navy flex-shrink-0" />
              </button>
            );
          }

          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-0.5 my-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
              <span className="flex-1">{parseInlineFormatting(itemText)}</span>
            </div>
          );
        }

        return <p key={lineIdx}>{parseInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
}

function parseInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-navy bg-slate-100 px-1 rounded text-[11px]">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function HelpAssistantWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isContact = session?.user?.role === UserRole.CONTACT;
  const suggestions = isContact ? contactSuggestions : workspaceSuggestions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = { id: userMsgId, role: "user", content: text };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/help-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const rawReply = data.message || "I could not retrieve an answer at this time.";

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: "", isStreaming: true }]);

      streamText(botMsgId, rawReply);
    } catch {
      const botMsgId = `bot-err-${Date.now()}`;
      const fallbackReply =
        "Unable to query database right now. Please check server status.";
      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  const streamText = (msgId: string, fullText: string) => {
    let index = 0;
    const chunkSize = 3;

    const interval = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        index = fullText.length;
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: fullText, isStreaming: false } : m))
        );
      } else {
        const partial = fullText.slice(0, index);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: partial, isStreaming: true } : m))
        );
      }
    }, 10);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div ref={containerRef}>
      {/* Launcher Button Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-center">
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-slate-200 cursor-pointer ${
            open
              ? "!bg-navy text-white border-navy"
              : "bg-white hover:bg-slate-50 text-navy"
          }`}
          aria-label={open ? "Close Assistant" : "Open Assistant"}
        >
          {open ? (
            <X className="h-5 w-5 text-white transition-transform duration-200" />
          ) : (
            <div className="relative flex items-center justify-center">
              <RobotIcon size={26} isHovered={isBtnHovered} isThinking={loading} isOpen={open} />
            </div>
          )}
        </button>
      </div>

      {/* Balanced Enterprise Copilot Panel */}
      <Card
        className={`fixed bottom-[68px] right-3 sm:bottom-[76px] sm:right-5 z-50 w-[calc(100vw-1.5rem)] sm:w-[360px] h-[460px] sm:h-[490px] max-h-[calc(100vh-90px)] flex flex-col shadow-xl border border-slate-200 bg-white rounded-xl overflow-hidden transition-all duration-200 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-navy text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
              <Bot className="h-4 w-4 text-teal-light" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">LedgerOne Copilot</h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  <Database className="h-2 w-2" />
                  <span>Live</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Accounting & ERP Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Minimal Intro */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-navy mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-teal" />
                  <span>Ask LedgerOne ERP</span>
                </div>
                Query stock availability, customer invoices, revenue totals, or sales orders.
              </div>

              {/* Quick Queries */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
                  Suggested Queries
                </span>
                <div className="space-y-1">
                  {suggestions.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.text)}
                        className="w-full text-left text-xs p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal/40 hover:bg-slate-50 text-navy transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal flex-shrink-0" />
                          <span className="truncate text-[11.5px] font-medium">{item.text}</span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-teal flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-navy text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div>
                    <FormattedMessage content={msg.content} onQuestionClick={(q) => sendMessage(q)} />
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3 bg-teal ml-1 animate-pulse align-middle" />
                    )}
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-150">
              <div className="bg-white border border-slate-200 rounded-xl rounded-bl-none px-3 py-2 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                <RobotIcon size={18} isThinking={true} />
                <span className="text-[11px] font-medium text-teal animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock, sales, invoices..."
              disabled={loading}
              className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-navy bg-slate-50 border-slate-200"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="h-9 w-9 p-0 flex-shrink-0 bg-navy hover:bg-navy-dark transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
