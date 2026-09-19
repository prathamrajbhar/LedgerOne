"use client";

import * as React from "react";

export function renderInlineText(text: string, isUser: boolean): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // Inline Code: `code`
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      const code = token.slice(1, -1);
      return (
        <code
          key={idx}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            isUser
              ? "bg-white/20 text-white"
              : "bg-slate-200/70 dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-semibold"
          }`}
        >
          {code}
        </code>
      );
    }

    // Bold: **text**
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      const boldText = token.slice(2, -2);
      return (
        <strong
          key={idx}
          className={`font-semibold ${isUser ? "text-white" : "text-slate-900 dark:text-slate-100"}`}
        >
          {renderInlineText(boldText, isUser)}
        </strong>
      );
    }

    // Italic: *text*
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      const italicText = token.slice(1, -1);
      return (
        <em
          key={idx}
          className={`italic ${isUser ? "text-slate-200" : "text-slate-500 dark:text-slate-400"}`}
        >
          {renderInlineText(italicText, isUser)}
        </em>
      );
    }

    // Links: [label](url)
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={idx}>{token}</span>;
  });
}
