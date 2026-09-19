"use client";

import * as React from "react";
import { ChatCodeBlock } from "./chat-code-block";
import { renderInlineText } from "./chat-inline-renderer";

interface ChatMarkdownProps {
  content: string;
  isUser?: boolean;
}

export function ChatMarkdown({ content, isUser = false }: ChatMarkdownProps) {
  if (!content) return null;

  // Split content by code blocks first
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed text-xs">
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        // Fenced code block
        if (block.startsWith("```") && block.endsWith("```")) {
          const firstLineEnd = block.indexOf("\n");
          const language = block.slice(3, firstLineEnd).trim();
          const code = block.slice(firstLineEnd + 1, -3);
          return <ChatCodeBlock key={bIdx} code={code} language={language} />;
        }

        // Paragraphs & lines
        const lines = block.split("\n");
        const renderedElements: React.ReactNode[] = [];
        let currentList: { type: "ol" | "ul"; items: { num?: string; text: string }[] } | null = null;

        const flushList = (keyPrefix: string) => {
          if (!currentList) return;
          if (currentList.type === "ol") {
            renderedElements.push(
              <ol key={`${keyPrefix}-ol`} className="space-y-1.5 my-2 pl-0.5">
                {currentList.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold mt-0.5 select-none">
                      {item.num ? item.num.replace(/[\.\)]/, "") : iIdx + 1}
                    </span>
                    <div className="flex-1 text-[11px] leading-relaxed">{renderInlineText(item.text, isUser)}</div>
                  </li>
                ))}
              </ol>
            );
          } else {
            renderedElements.push(
              <ul key={`${keyPrefix}-ul`} className="space-y-1.5 my-2 pl-0.5">
                {currentList.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                    <div className="flex-1">{renderInlineText(item.text, isUser)}</div>
                  </li>
                ))}
              </ul>
            );
          }
          currentList = null;
        };

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            flushList(`l-${bIdx}-${lIdx}`);
            return;
          }

          // Numbered list: "1. item", "2) item"
          const olMatch = trimmed.match(/^(\d+[\.\)])\s+(.+)$/);
          if (olMatch) {
            if (!currentList || currentList.type !== "ol") {
              flushList(`l-${bIdx}-${lIdx}`);
              currentList = { type: "ol", items: [] };
            }
            currentList.items.push({ num: olMatch[1], text: olMatch[2] });
            return;
          }

          // Bullet list: "- item", "* item", "• item"
          const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
          if (ulMatch) {
            if (!currentList || currentList.type !== "ul") {
              flushList(`l-${bIdx}-${lIdx}`);
              currentList = { type: "ul", items: [] };
            }
            currentList.items.push({ text: ulMatch[1] });
            return;
          }

          // Headers / Paragraphs
          flushList(`l-${bIdx}-${lIdx}`);

          if (trimmed.startsWith("### ")) {
            renderedElements.push(
              <h5 key={`h5-${bIdx}-${lIdx}`} className="font-bold text-xs pt-1 text-slate-900 dark:text-slate-100">
                {renderInlineText(trimmed.slice(4), isUser)}
              </h5>
            );
          } else if (trimmed.startsWith("## ")) {
            renderedElements.push(
              <h4 key={`h4-${bIdx}-${lIdx}`} className="font-bold text-sm pt-1 text-slate-900 dark:text-slate-100">
                {renderInlineText(trimmed.slice(3), isUser)}
              </h4>
            );
          } else {
            renderedElements.push(
              <p key={`p-${bIdx}-${lIdx}`} className="leading-relaxed">
                {renderInlineText(trimmed, isUser)}
              </p>
            );
          }
        });

        flushList(`final-${bIdx}`);

        return <React.Fragment key={bIdx}>{renderedElements}</React.Fragment>;
      })}
    </div>
  );
}
