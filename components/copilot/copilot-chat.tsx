"use client";

import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { useRouter, usePathname } from "next/navigation";
import { Send, Loader2, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChatWelcome } from "./chat-welcome";
import { ChatMessageItem } from "./chat-message-item";

const STORAGE_KEY = "ledgerone_copilot_history_v2";

export function CopilotChat({ resetTrigger }: { resetTrigger?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledNavCalls = useRef<Set<string>>(new Set());

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/copilot/chat" }), []);

  const { messages, sendMessage, status, addToolResult, setMessages } = useChat({
    transport,
    messages: [],
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Restore session history from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      // ignore
    }
  }, [setMessages]);

  // Sync messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [resetTrigger, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Execute client-side navigation tool invocations
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role !== "assistant" || !msg.parts) return;
      msg.parts.forEach((part) => {
        if (isToolUIPart(part) && getToolName(part) === "navigateTo" && part.state === "input-available") {
          const toolCallId = part.toolCallId;
          if (!handledNavCalls.current.has(toolCallId)) {
            handledNavCalls.current.add(toolCallId);
            const args = part.input as { path: string; label: string };
            if (args?.path) {
              router.push(args.path);
              void addToolResult({
                tool: "navigateTo",
                toolCallId,
                state: "output-available",
                output: { success: true, navigatedTo: args.path, label: args.label },
              });
            }
          }
        }
      });
    });
  }, [messages, router, addToolResult]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const text = inputVal.trim();
    setInputVal("");
    await sendMessage({ role: "user", parts: [{ type: "text", text }] });
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage({ role: "user", parts: [{ type: "text", text: prompt }] });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Context Ribbon Banner */}
      <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1 font-mono truncate max-w-[65%]">
          <MapPin className="w-3 h-3 text-teal shrink-0" />
          <span className="truncate">{pathname || "/dashboard"}</span>
        </span>
        <button
          type="button"
          onClick={() => handleQuickPrompt(`Summarize current ERP data for ${pathname}`)}
          className="text-teal hover:underline flex items-center gap-1 font-medium cursor-pointer shrink-0"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>Summarize Page</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.length === 0 && <ChatWelcome onSelectPrompt={handleQuickPrompt} />}
        {messages.map((m) => (
          <ChatMessageItem key={m.id} message={m} onAddToolResult={addToolResult} />
        ))}
        {isLoading && status === "submitted" && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal" />
            <span className="italic">LedgerOne Copilot is reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about finances, pending bills, records..."
            disabled={isLoading}
            className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus-visible:ring-teal"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !inputVal.trim()}
            className="h-9 w-9 p-0 bg-navy hover:bg-slate-800 text-white rounded-lg shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-teal" /> : <Send className="h-4 w-4 text-teal" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
