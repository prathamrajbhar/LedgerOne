"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  HelpCircle,
  Database,
  RefreshCw,
  Box,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  ArrowRight,
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
    label: "Inventory Count",
  },
  {
    icon: AlertTriangle,
    text: "Which items are currently low on stock?",
    label: "Low Stock Alert",
  },
  {
    icon: Users,
    text: "How many customers and vendors are registered?",
    label: "Contacts Directory",
  },
  {
    icon: TrendingUp,
    text: "Show overall total revenue & net profit",
    label: "Financial KPIs",
  },
  {
    icon: FileText,
    text: "What is our customer invoice & receivable total?",
    label: "Invoices Summary",
  },
];

const contactSuggestions = [
  {
    icon: FileText,
    text: "What is my outstanding invoice balance?",
    label: "My Invoices",
  },
  {
    icon: Box,
    text: "How many products do we have in stock?",
    label: "Catalog Availability",
  },
  {
    icon: AlertTriangle,
    text: "Show my recent invoices and due dates",
    label: "Recent Invoices",
  },
];

/**
 * Render Markdown formatted content safely with visual badges, bullet lists, and interactive clickable questions.
 */
function FormattedMessage({
  content,
  onQuestionClick,
}: {
  content: string;
  onQuestionClick?: (text: string) => void;
}) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        // Header 3 or Header 4
        if (trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
          const title = trimmed.replace(/^#{3,4}\s+/, "");
          return (
            <h4 key={lineIdx} className="font-bold text-navy text-[13px] mt-2 mb-1 flex items-center gap-1.5 border-b border-border/50 pb-1">
              {parseInlineFormatting(title)}
            </h4>
          );
        }

        // Bullet items (Check if this is a suggested question)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.substring(2);

          // Extract question inside quotes (e.g. * 'How many products do we have in stock?') or ending in ?
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
                className="w-full text-left text-[11.5px] p-2.5 my-1 rounded-xl bg-[#F0F4F8] hover:bg-[#E2ECF5] border border-teal/30 hover:border-teal text-navy transition-all duration-200 flex items-center justify-between group shadow-2xs hover:shadow-sm cursor-pointer transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <div className="p-1 rounded-md bg-teal/15 text-teal group-hover:bg-teal group-hover:text-white transition-colors flex-shrink-0">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold truncate text-navy">{cleanQuestion}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-teal/60 group-hover:text-teal group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          }

          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
              <span className="flex-1">{parseInlineFormatting(itemText)}</span>
            </div>
          );
        }

        // Regular line
        return <p key={lineIdx}>{parseInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
}

/**
 * Helper to parse inline markdown like **bold**, `code`, and currency highlights
 */
function parseInlineFormatting(text: string) {
  // Split by bold (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      // Highlight numbers or currencies with a subtle badge styling if needed
      return (
        <strong key={idx} className="font-semibold text-navy bg-[#E8F0F7]/70 px-1 py-0.5 rounded text-[11.5px]">
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
  const [processingStage, setProcessingStage] = useState("");
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isContact = session?.user?.role === UserRole.CONTACT;
  const suggestions = isContact ? contactSuggestions : workspaceSuggestions;

  // Click outside to close chatbot drawer automatically
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

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, loading, processingStage]);

  // Handle step-by-step processing status messages
  const startProcessingAnimation = () => {
    setProcessingStage("Analyzing query...");

    stageTimerRef.current = setTimeout(() => {
      setProcessingStage("Querying LedgerOne Database...");
      stageTimerRef.current = setTimeout(() => {
        setProcessingStage("Formatting live insights...");
      }, 700);
    }, 600);
  };

  const clearProcessingAnimation = () => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
    }
    setProcessingStage("");
  };

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = { id: userMsgId, role: "user", content: text };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);
    startProcessingAnimation();

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

      clearProcessingAnimation();

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const rawReply = data.message || "I could not retrieve an answer at this time.";

      // Add typewriter streaming effect
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: "", isStreaming: true }]);

      streamText(botMsgId, rawReply);
    } catch {
      clearProcessingAnimation();
      const botMsgId = `bot-err-${Date.now()}`;
      const fallbackReply =
        "I am currently having trouble reaching the database route. Please ensure your LedgerOne server is running smoothly.";
      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  // Stream text character by character for realistic AI effect
  const streamText = (msgId: string, fullText: string) => {
    let index = 0;
    const chunkSize = 3; // stream 3 chars at a time for smooth speed

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
    }, 15);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div ref={containerRef}>
      <style>{`
        @keyframes roboJump2s {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          15% {
            transform: translateY(4px) scale(1.08, 0.92);
          }
          38% {
            transform: translateY(-22px) scale(0.92, 1.08);
          }
          52% {
            transform: translateY(-24px) scale(1.02, 0.98);
          }
          68% {
            transform: translateY(0) scale(1.1, 0.9);
          }
          78% {
            transform: translateY(-6px) scale(0.98, 1.02);
          }
          88% {
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shadowPulse2s {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          38%, 52% {
            transform: scale(0.5);
            opacity: 0.2;
          }
          68% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .animate-robo-jump {
          animation: roboJump2s 2s ease-in-out infinite;
        }
        .animate-shadow-pulse {
          animation: shadowPulse2s 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Toggle Button Container with Ground Shadow Reflection */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        {/* Dynamic Ground Shadow Reflection */}
        {!open && (
          <div className="absolute -bottom-1 w-9 h-2 rounded-full bg-teal/25 blur-xs pointer-events-none animate-shadow-pulse" />
        )}

        {/* Main Floating Robot Button */}
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-navy shadow-[0_8px_25px_rgba(22,50,79,0.22),0_0_15px_rgba(22,124,128,0.2)] hover:shadow-[0_12px_32px_rgba(22,50,79,0.3),0_0_22px_rgba(22,124,128,0.35)] transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-teal relative group ${
            open
              ? "!bg-navy text-white border-navy"
              : "animate-robo-jump bg-gradient-to-br from-white via-[#F4F8FA] to-[#E6EFF6]"
          }`}
          aria-label={open ? "Close Help Assistant" : "Open Help Assistant"}
        >
          {open ? (
            <X className="h-5 w-5 text-white transition-transform duration-300" />
          ) : (
            <div className="relative flex items-center justify-center">
              <RobotIcon size={36} isHovered={isBtnHovered} isThinking={loading} isOpen={open} />
            </div>
          )}
        </button>
      </div>

      {/* Main Chat Widget Drawer Container with Premium Backdrop Elevation & Smooth Exit Animation */}
      <Card
        className={`fixed bottom-[84px] right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-100px)] flex flex-col shadow-[0_20px_60px_-15px_rgba(22,50,79,0.35),0_0_25px_rgba(22,124,128,0.15)] hover:shadow-[0_25px_70px_-15px_rgba(22,50,79,0.45),0_0_30px_rgba(22,124,128,0.25)] border border-border bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-navy via-[#1B3B5F] to-navy text-white shadow-md border-b border-teal/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-teal/20 text-teal-light border border-teal/30 shadow-xs flex items-center justify-center">
              <RobotIcon size={26} isHovered={true} isThinking={loading} isOpen={open} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold leading-tight tracking-wide drop-shadow-xs">LedgerOne AI Assistant</h3>
                <span className="flex items-center gap-1 text-[9px] font-semibold bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 shadow-2xs">
                  <Database className="h-2.5 w-2.5 text-emerald-400" />
                  <span>Live DB</span>
                </span>
              </div>
              <p className="text-[10px] text-white/80 mt-0.5 font-medium">Real-time Accounting & ERP Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-md text-white/75 hover:text-white hover:bg-white/15 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md text-white/75 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message History Container with Distinct Slate Tint */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#EEF2F6]">
          {messages.length === 0 && (
            <div className="space-y-3.5 pt-1 animate-in fade-in duration-300">
              {/* Welcome Banner */}
              <div className="p-3.5 rounded-xl bg-white border border-navy/15 shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 font-bold text-navy text-xs">
                  <Sparkles className="h-4 w-4 text-teal animate-pulse" />
                  <span>Hello! I am your LedgerOne AI ERP Assistant</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  I have direct access to your database to help you query products, stock levels, sales orders, invoices, contacts, and financial summaries.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Sensitive auth credentials & passwords are protected.</span>
                </div>
              </div>

              {/* Quick Query Suggestions */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-navy/75 uppercase tracking-wider px-1 flex items-center gap-1">
                  <Database className="h-3 w-3 text-teal" />
                  <span>Live Database Queries</span>
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  {suggestions.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.text)}
                        className="text-left text-xs p-2.5 rounded-xl bg-white border border-navy/15 hover:border-teal hover:bg-[#E8F0F7] text-foreground transition-all duration-200 flex items-center justify-between group shadow-xs hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-md bg-teal/15 text-teal group-hover:bg-teal group-hover:text-white transition-colors flex-shrink-0">
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate text-[11.5px] font-medium text-navy">{item.text}</span>
                        </div>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-teal transition-colors flex-shrink-0 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-navy via-[#16324F] to-[#102A43] text-white rounded-br-xs shadow-md border border-navy/30"
                    : "bg-white text-foreground border border-navy/15 rounded-bl-xs shadow-sm hover:shadow-md transition-shadow"
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

          {/* Step-by-Step Processing Status Animation */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-white border border-navy/15 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-navy flex items-center gap-3 shadow-sm">
                <RobotIcon size={24} isThinking={true} />
                <div className="flex flex-col">
                  <span className="font-bold text-[11px] text-teal animate-pulse">{processingStage || "Processing..."}</span>
                  <span className="text-[9.5px] text-muted-foreground font-medium">Fetching database context</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Context Action Chips (When chat has history) */}
        {messages.length > 0 && !loading && (
          <div className="px-3 py-1.5 bg-[#F1F5F9] border-t border-border/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => sendMessage("How many products do we have in stock?")}
              className="text-[10px] whitespace-nowrap px-2 py-1 rounded-lg bg-white border border-border text-navy hover:bg-teal/10 hover:border-teal/40 transition-colors flex items-center gap-1"
            >
              <Box className="h-2.5 w-2.5 text-teal" />
              <span>Products</span>
            </button>
            <button
              onClick={() => sendMessage("Which items are low on stock?")}
              className="text-[10px] whitespace-nowrap px-2 py-1 rounded-lg bg-white border border-border text-navy hover:bg-teal/10 hover:border-teal/40 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
              <span>Low Stock</span>
            </button>
            <button
              onClick={() => sendMessage("What is our total revenue and net profit?")}
              className="text-[10px] whitespace-nowrap px-2 py-1 rounded-lg bg-white border border-border text-navy hover:bg-teal/10 hover:border-teal/40 transition-colors flex items-center gap-1"
            >
              <TrendingUp className="h-2.5 w-2.5 text-emerald-600" />
              <span>Financials</span>
            </button>
            <button
              onClick={() => sendMessage("What is our customer invoice & receivable total?")}
              className="text-[10px] whitespace-nowrap px-2 py-1 rounded-lg bg-white border border-border text-navy hover:bg-teal/10 hover:border-teal/40 transition-colors flex items-center gap-1"
            >
              <FileText className="h-2.5 w-2.5 text-blue-600" />
              <span>Invoices</span>
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 border-t border-border/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, stock, invoices, revenue..."
              disabled={loading}
              className="h-10 text-xs focus-visible:ring-teal bg-[#F8FAFC]"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="h-10 w-10 p-0 flex-shrink-0 bg-navy hover:bg-navy-hover transition-colors"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
