"use client";

import * as React from "react";
import { UIMessage, isTextUIPart, isToolUIPart, getToolName } from "ai";
import { Bot, User, Loader2 } from "lucide-react";

import { NavigationCard } from "./cards/navigation-card";
import { KPICard, KPICardData } from "./cards/kpi-card";
import { RecordsCard, RecordsCardProps } from "./cards/records-card";
import { DocumentCard, DocumentDetails } from "./cards/document-card";
import { BudgetCard, BudgetCardData } from "./cards/budget-card";
import { ActionCard } from "./cards/action-card";
import { PdfCard, PdfCardData } from "./cards/pdf-card";
import { AccountBalanceCard, AccountBalanceCardData } from "./cards/account-balance-card";
import { ChatMarkdown } from "./chat-markdown";

interface ChatMessageItemProps {
  message: UIMessage;
  onAddToolResult: (params: { tool: string; toolCallId: string; state: "output-available"; output: Record<string, unknown> }) => void;
  onSelectPrompt?: (prompt: string) => void;
}

const SENSITIVE_ACTION_TOOLS = new Set([
  "createContactAction",
  "sendInvoicePaymentReminder",
  "createCustomerInvoiceDraftAction",
  "createVendorBillDraftAction",
  "recordExpenseAction",
  "recordPaymentAction",
  "createSalesOrderAction",
  "confirmSalesOrderAction",
  "convertSalesOrderToInvoiceAction",
  "createPurchaseOrderAction",
  "confirmPurchaseOrderAction",
  "convertPurchaseOrderToBillAction",
  "createProductAction",
  "adjustStockAction",
]);

export function ChatMessageItem({ message, onAddToolResult, onSelectPrompt }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} text-xs leading-relaxed`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-teal" />
        </div>
      )}

      <div
        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 space-y-2.5 ${
          isUser
            ? "bg-navy text-white rounded-br-none"
            : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none shadow-xs"
        }`}
      >
        {message.parts?.map((part, pIdx) => {
          if (isTextUIPart(part)) {
            return <ChatMarkdown key={pIdx} content={part.text} isUser={isUser} />;
          }

          if (isToolUIPart(part)) {
            const toolName = getToolName(part);

            if (toolName === "navigateTo") {
              return <NavigationCard key={pIdx} input={part.input as { path: string; label: string; description?: string }} />;
            }
            if (toolName === "getFinancialKPIs" && part.state === "output-available") {
              return <KPICard key={pIdx} data={part.output as KPICardData} />;
            }
            if (toolName === "queryPlatformRecords" && part.state === "output-available") {
              return <RecordsCard key={pIdx} data={part.output as RecordsCardProps} />;
            }
            if (toolName === "getDocumentDetails" && part.state === "output-available") {
              return <DocumentCard key={pIdx} data={part.output as { found: boolean; details?: DocumentDetails; message?: string }} />;
            }
            if (toolName === "getBudgetStatus" && part.state === "output-available") {
              return <BudgetCard key={pIdx} data={part.output as BudgetCardData} />;
            }
            if (toolName === "getDocumentPdfLink" && part.state === "output-available") {
              return <PdfCard key={pIdx} data={part.output as PdfCardData} />;
            }
            if (toolName === "getAccountBalances" && part.state === "output-available") {
              return <AccountBalanceCard key={pIdx} data={part.output as AccountBalanceCardData} />;
            }

            if (SENSITIVE_ACTION_TOOLS.has(toolName)) {
              return (
                <ActionCard
                  key={pIdx}
                  toolName={toolName}
                  toolCallId={part.toolCallId}
                  input={(part.input || {}) as Record<string, unknown>}
                  state={part.state}
                  output={part.output as Record<string, unknown> | undefined}
                  onAddToolResult={onAddToolResult}
                  onSelectPrompt={onSelectPrompt}
                />
              );
            }

            if (part.state === "input-streaming") {
              return (
                <div key={pIdx} className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin text-teal" />
                  <span>Processing ERP request...</span>
                </div>
              );
            }
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
}
