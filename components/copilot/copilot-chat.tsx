"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName, isTextUIPart } from "ai";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
  FileText,
  Package,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { executeCopilotAction } from "@/app/actions/copilot.actions";

export function CopilotChat() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [executingCallIds, setExecutingCallIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledNavCalls = useRef<Set<string>>(new Set());

  // Initialize useChat with DefaultChatTransport targeting our Copilot API
  const transport = React.useMemo(
    () => new DefaultChatTransport({ api: "/api/copilot/chat" }),
    []
  );

  const {
    messages,
    sendMessage,
    status,
    addToolResult,
  } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Handle client-side navigation tool invocations
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role !== "assistant" || !msg.parts) return;
      msg.parts.forEach((part) => {
        if (isToolUIPart(part)) {
          const toolName = getToolName(part);
          if (toolName === "navigateTo" && part.state === "input-available") {
            const toolCallId = part.toolCallId;
            if (!handledNavCalls.current.has(toolCallId)) {
              handledNavCalls.current.add(toolCallId);
              const args = part.input as { path: string; label: string; description?: string };
              if (args?.path) {
                // Execute client navigation
                router.push(args.path);
                // Report back to model
                void addToolResult({
                  tool: "navigateTo",
                  toolCallId,
                  state: "output-available",
                  output: { success: true, navigatedTo: args.path, label: args.label },
                });
              }
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
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: prompt }],
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-6 px-2 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                LedgerOne Agentic Copilot
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Autonomous ERP assistant for financial reporting, record lookups, invoice dispatch, and navigation.
              </p>
            </div>

            {/* Quick Action Suggestions */}
            <div className="space-y-1.5 pt-2 text-left max-w-sm mx-auto">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                Suggested Actions
              </span>
              {[
                "What is our net profit & overdue invoices count?",
                "Find customer 'Apex Solutions' or check invoices",
                "Take me to the customer invoices page",
                "Create a customer named 'Nova Systems' with email 'nova@corp.com'",
              ].map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(query)}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-slate-700 dark:text-slate-200 truncate mr-2">{query}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} text-xs leading-relaxed`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 space-y-2.5 ${
                  isUser
                    ? "bg-navy text-white rounded-br-none"
                    : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none shadow-xs"
                }`}
              >
                {/* Render Parts */}
                {message.parts?.map((part, pIdx) => {
                  // Text part
                  if (isTextUIPart(part)) {
                    return (
                      <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
                        {part.text}
                      </p>
                    );
                  }

                  // Tool UI Part
                  if (isToolUIPart(part)) {
                    const toolName = getToolName(part);

                    // A. NAVIGATE TO CARD
                    if (toolName === "navigateTo") {
                      const args = part.input as { path: string; label: string; description?: string };
                      return (
                        <div
                          key={pIdx}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-teal/30 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-teal text-[11px] flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Page Navigation
                            </span>
                            <Badge variant="outline" className="text-[9px] border-teal/30 text-teal">
                              Route
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Navigating to: <strong className="text-slate-900 dark:text-white">{args?.label || args?.path}</strong>
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(args?.path)}
                            className="w-full text-xs h-7 gap-1 font-medium cursor-pointer"
                          >
                            <span>Open {args?.label || "Page"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    }

                    // B. FINANCIAL KPIS CARD
                    if (toolName === "getFinancialKPIs") {
                      if (part.state === "output-available") {
                        const data = part.output as {
                          financialSummary?: {
                            totalRevenue: number;
                            totalExpenses: number;
                            netProfit: number;
                            accountsReceivable: number;
                            accountsPayable: number;
                            cashBalance: number;
                          };
                          overdueInvoicesCount?: number;
                          sampleOverdueInvoices?: Array<{
                            id: string;
                            invoiceNumber: string;
                            customerName: string;
                            amountDue: number;
                            dueDate: string;
                          }>;
                        };

                        const summary = data?.financialSummary;

                        return (
                          <div
                            key={pIdx}
                            className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                              <span className="font-bold text-navy dark:text-slate-100 flex items-center gap-1.5 text-xs">
                                <TrendingUp className="w-3.5 h-3.5 text-teal" />
                                Financial KPI Dashboard
                              </span>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                Real-Time
                              </Badge>
                            </div>

                            {summary && (
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
                                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Revenue</span>
                                  <span className="font-semibold text-emerald-600">
                                    ₹{summary.totalRevenue.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
                                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Net Profit</span>
                                  <span className={`font-semibold ${summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    ₹{summary.netProfit.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
                                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Receivables</span>
                                  <span className="font-semibold text-amber-600">
                                    ₹{summary.accountsReceivable.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80">
                                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Payables</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    ₹{summary.accountsPayable.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {data?.overdueInvoicesCount !== undefined && data.overdueInvoicesCount > 0 && (
                              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  {data.overdueInvoicesCount} Overdue Invoices
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push("/invoices")}
                                  className="h-5 px-2 text-[10px] text-amber-800 dark:text-amber-200 hover:bg-amber-100"
                                >
                                  View
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div key={pIdx} className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Loader2 className="w-3 h-3 animate-spin text-teal" />
                          <span>Fetching financial KPIs...</span>
                        </div>
                      );
                    }

                    // C. RECORD SEARCH CARD
                    if (toolName === "searchERPRecords") {
                      if (part.state === "output-available") {
                        const data = part.output as {
                          products?: Array<{ id: string; name: string; sku: string | null; stock: number; salesPrice: number; status: string }>;
                          contacts?: Array<{ id: string; name: string; email: string; type: string; phone: string | null }>;
                          invoices?: Array<{ id: string; invoiceNumber: string; customerName: string; total: number; amountDue: number; status: string }>;
                        };

                        const hasResults =
                          (data?.products && data.products.length > 0) ||
                          (data?.contacts && data.contacts.length > 0) ||
                          (data?.invoices && data.invoices.length > 0);

                        return (
                          <div
                            key={pIdx}
                            className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
                          >
                            <span className="font-bold text-navy dark:text-slate-100 flex items-center gap-1.5 text-xs">
                              <Building2 className="w-3.5 h-3.5 text-teal" />
                              ERP Database Records
                            </span>

                            {!hasResults && (
                              <p className="text-[11px] text-slate-500 italic">No matching records found.</p>
                            )}

                            {data?.contacts && data.contacts.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Contacts</span>
                                {data.contacts.map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => router.push(`/contacts`)}
                                    className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center justify-between text-[11px] cursor-pointer"
                                  >
                                    <div>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                                      <span className="text-slate-400 block text-[10px]">{c.email}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[9px]">
                                      {c.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}

                            {data?.invoices && data.invoices.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Invoices</span>
                                {data.invoices.map((inv) => (
                                  <div
                                    key={inv.id}
                                    onClick={() => router.push(`/invoices/${inv.id}`)}
                                    className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center justify-between text-[11px] cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="w-3 h-3 text-teal shrink-0" />
                                      <div>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          {inv.invoiceNumber}
                                        </span>
                                        <span className="text-slate-400 block text-[10px]">{inv.customerName}</span>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      ₹{inv.total.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {data?.products && data.products.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Products</span>
                                {data.products.map((p) => (
                                  <div
                                    key={p.id}
                                    onClick={() => router.push(`/products`)}
                                    className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center justify-between text-[11px] cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Package className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {p.name}
                                      </span>
                                    </div>
                                    <Badge
                                      variant={p.status === "OUT_OF_STOCK" ? "destructive" : "secondary"}
                                      className="text-[9px]"
                                    >
                                      {p.stock} in stock
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div key={pIdx} className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Loader2 className="w-3 h-3 animate-spin text-teal" />
                          <span>Searching records...</span>
                        </div>
                      );
                    }

                    // D. SENSITIVE WRITE ACTION CONFIRMATION CARD (Human in the Loop)
                    if (toolName === "createContactAction" || toolName === "sendInvoicePaymentReminder") {
                      const isContactAction = toolName === "createContactAction";
                      const isReminderAction = toolName === "sendInvoicePaymentReminder";

                      const isExecuting = executingCallIds.has(part.toolCallId);

                      if (part.state === "output-available") {
                        const result = part.output as {
                          success?: boolean;
                          cancelled?: boolean;
                          message?: string;
                          error?: string;
                        };

                        if (result?.cancelled) {
                          return (
                            <div
                              key={pIdx}
                              className="p-2.5 rounded-lg border text-[11px] flex items-start gap-2 bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block">Action Cancelled</span>
                                <span>{result.message || "Operation was cancelled by user."}</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={pIdx}
                            className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                              result?.success
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                            }`}
                          >
                            {result?.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold block">
                                {result?.success ? "Action Completed" : "Action Failed"}
                              </span>
                              <span>{result?.message || result?.error}</span>
                            </div>
                          </div>
                        );
                      }

                      // Pending Approval / Confirmation Step
                      return (
                        <div
                          key={pIdx}
                          className="p-3 bg-white dark:bg-slate-900 rounded-lg border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              Action Approval Required
                            </span>
                            <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-700">
                              Sensitive
                            </Badge>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded">
                            {isContactAction && (() => {
                              const contactInput = (part.input || {}) as Record<string, unknown>;
                              return (
                                <>
                                  <p><strong>Action:</strong> Create new {String(contactInput.type || "Contact").toLowerCase()}</p>
                                  <p><strong>Name:</strong> {String(contactInput.name || "")}</p>
                                  <p><strong>Email:</strong> {String(contactInput.email || "")}</p>
                                  {Boolean(contactInput.phone) && <p><strong>Phone:</strong> {String(contactInput.phone)}</p>}
                                  {Boolean(contactInput.city) && <p><strong>City:</strong> {String(contactInput.city)}</p>}
                                </>
                              );
                            })()}
                            {isReminderAction && (() => {
                              const reminderInput = (part.input || {}) as Record<string, unknown>;
                              return (
                                <>
                                  <p><strong>Action:</strong> Dispatch email payment reminder with invoice PDF</p>
                                  <p><strong>Invoice:</strong> {String(reminderInput.invoiceId || "")}</p>
                                  {Boolean(reminderInput.customNote) && <p><strong>Note:</strong> {String(reminderInput.customNote)}</p>}
                                </>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isExecuting}
                              onClick={async () => {
                                if (isExecuting) return;
                                setExecutingCallIds((prev) => new Set(prev).add(part.toolCallId));
                                try {
                                  const execution = await executeCopilotAction(
                                    toolName,
                                    (part.input || {}) as Record<string, unknown>
                                  );
                                  void addToolResult({
                                    tool: toolName,
                                    toolCallId: part.toolCallId,
                                    state: "output-available",
                                    output: execution,
                                  });
                                } catch (err) {
                                  const error = err as Error;
                                  void addToolResult({
                                    tool: toolName,
                                    toolCallId: part.toolCallId,
                                    state: "output-available",
                                    output: {
                                      success: false,
                                      error: error.message || "Failed to execute action.",
                                    },
                                  });
                                } finally {
                                  setExecutingCallIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(part.toolCallId);
                                    return next;
                                  });
                                }
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 gap-1 font-medium cursor-pointer"
                            >
                              {isExecuting ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Executing...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isExecuting}
                              onClick={() => {
                                void addToolResult({
                                  tool: toolName,
                                  toolCallId: part.toolCallId,
                                  state: "output-available",
                                  output: {
                                    success: false,
                                    cancelled: true,
                                    message: "Action was cancelled by user.",
                                  },
                                });
                              }}
                              className="flex-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-7 gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }

                  return null;
                })}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal" />
            <span>Copilot is analyzing ERP data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about finances, customers, or navigate..."
            disabled={isLoading}
            className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-navy bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !inputVal.trim()}
            className="h-9 w-9 p-0 bg-navy hover:bg-navy-dark text-white shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
