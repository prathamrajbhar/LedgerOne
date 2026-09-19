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
  ShieldCheck,
  Bot,
  Zap,
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
    category: "Inventory",
  },
  {
    icon: AlertTriangle,
    text: "Which items are currently low on stock?",
    category: "Stock Alert",
  },
  {
    icon: Users,
    text: "How many customers and vendors are registered?",
    category: "Directory",
  },
  {
    icon: TrendingUp,
    text: "Show overall total revenue & net profit",
    category: "Financials",
  },
  {
    icon: FileText,
    text: "What is our customer invoice & receivable total?",
    category: "Receivables",
  },
];

const contactSuggestions = [
  {
    icon: FileText,
    text: "What is my outstanding invoice balance?",
    category: "My Account",
  },
  {
    icon: Box,
    text: "How many products do we have in stock?",
    category: "Catalog",
  },
  {
    icon: AlertTriangle,
    text: "Show my recent invoices and due dates",
    category: "Due Dates",
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
    <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        if (trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
          const title = trimmed.replace(/^#{3,4}\s+/, "");
          return (
            <h4 key={lineIdx} className="font-bold text-navy text-[12.5px] mt-2 mb-1 flex items-center gap-1.5 border-b border-slate-200/80 pb-1">
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
                className="w-full text-left text-[11.5px] p-2.5 my-1.5 rounded-xl bg-slate-50 hover:bg-teal/5 border border-slate-200 hover:border-teal/40 text-navy transition-all duration-200 flex items-center justify-between group shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <div className="p-1 rounded-md bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white transition-colors flex-shrink-0">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium truncate text-navy">{cleanQuestion}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          }

          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
              <span className="flex-1 text-slate-700">{parseInlineFormatting(itemText)}</span>
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
        <strong key={idx} className="font-semibold text-navy bg-slate-100 px-1 py-0.5 rounded text-[11.5px]">
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
  }, [messages, open, loading, processingStage]);

  const startProcessingAnimation = () => {
    setProcessingStage("Analyzing query context...");

    stageTimerRef.current = setTimeout(() => {
      setProcessingStage("Querying ERP database...");
      stageTimerRef.current = setTimeout(() => {
        setProcessingStage("Generating response...");
      }, 600);
    }, 500);
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

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: "", isStreaming: true }]);

      streamText(botMsgId, rawReply);
    } catch {
      clearProcessingAnimation();
      const botMsgId = `bot-err-${Date.now()}`;
      const fallbackReply =
        "I am currently having trouble reaching the database route. Please check system connectivity.";
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
    }, 12);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div ref={containerRef}>
      {/* Launcher Button Container */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center">
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full text-navy shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer ${
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
              <RobotIcon size={28} isHovered={isBtnHovered} isThinking={loading} isOpen={open} />
            </div>
          )}
        </button>
      </div>

      {/* Enterprise AI Drawer Panel */}
      <Card
        className={`fixed bottom-[76px] right-4 sm:bottom-[86px] sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[calc(100vh-100px)] flex flex-col shadow-2xl border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Enterprise Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-navy text-white border-b border-navy-hover">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <Bot className="h-4 w-4 text-teal-light" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-wide text-white">LedgerOne ERP Intelligence</h3>
                <span className="flex items-center gap-1 text-[9px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Database className="h-2.5 w-2.5" />
                  <span>Connected</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 font-normal">Real-time accounting & data copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
          {messages.length === 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Executive Welcome Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-navy text-xs">
                  <Zap className="h-4 w-4 text-teal" />
                  <span>Welcome to LedgerOne Copilot</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ask questions about live inventory levels, receivables, financial reports, or registered contact entities directly from your system.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500 font-medium border-t border-slate-100">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                  <span>Secure enterprise session • Role-gated database access</span>
                </div>
              </div>

              {/* Quick Query Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggested Queries
                  </span>
                </div>

                <div className="space-y-1.5">
                  {suggestions.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.text)}
                        className="w-full text-left text-xs p-3 rounded-xl bg-white border border-slate-200 hover:border-teal/40 hover:bg-slate-50 text-slate-800 transition-all duration-200 flex items-center justify-between group shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal/10 group-hover:text-teal transition-colors flex-shrink-0">
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate text-[11.5px] font-medium text-navy">{item.text}</span>
                        </div>
                        <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-teal transition-colors flex-shrink-0 ml-2">
                          {item.category}
                        </span>
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
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs ${
                  msg.role === "user"
                    ? "bg-navy text-white rounded-br-xs shadow-xs"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs"
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

          {/* Processing Indicator */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-navy flex items-center gap-3 shadow-2xs">
                <RobotIcon size={22} isThinking={true} />
                <div className="flex flex-col">
                  <span className="font-semibold text-[11px] text-teal animate-pulse">
                    {processingStage || "Analyzing query..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Chips for active conversations */}
        {messages.length > 0 && !loading && (
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => sendMessage("How many products do we have in stock?")}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal/10 hover:border-teal/30 hover:text-teal transition-colors cursor-pointer"
            >
              Inventory
            </button>
            <button
              onClick={() => sendMessage("Which items are low on stock?")}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal/10 hover:border-teal/30 hover:text-teal transition-colors cursor-pointer"
            >
              Stock Alerts
            </button>
            <button
              onClick={() => sendMessage("Show overall total revenue & net profit")}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal/10 hover:border-teal/30 hover:text-teal transition-colors cursor-pointer"
            >
              Revenue
            </button>
            <button
              onClick={() => sendMessage("What is our customer invoice & receivable total?")}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal/10 hover:border-teal/30 hover:text-teal transition-colors cursor-pointer"
            >
              Receivables
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock, sales, invoices, revenue..."
              disabled={loading}
              className="h-10 text-xs focus-visible:ring-1 focus-visible:ring-navy bg-slate-50 border-slate-200"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="h-10 w-10 p-0 flex-shrink-0 bg-navy hover:bg-navy-dark transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
