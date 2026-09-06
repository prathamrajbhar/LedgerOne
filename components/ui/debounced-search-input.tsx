"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DebouncedSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  containerClassName?: string;
}

export function DebouncedSearchInput({
  value: controlledValue,
  onChange,
  debounceMs = 300,
  containerClassName,
  className,
  placeholder = "Search...",
  ...props
}: DebouncedSearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(controlledValue ?? "");

  // Sync internal value if controlledValue changes externally
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced notification to parent onChange
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== (controlledValue ?? "")) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, controlledValue]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-8.5 pl-9 pr-8 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-navy transition-all",
          className
        )}
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          title="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
