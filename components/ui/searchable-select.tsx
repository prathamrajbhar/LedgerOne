"use client";

import * as React from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  size = "md",
  disabled = false,
  className,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(query) : false;
      return matchLabel || matchSub;
    });
  }, [options, search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      const firstAvailable = filteredOptions.find((opt) => !opt.disabled);
      if (firstAvailable) {
        onChange(firstAvailable.value);
        setOpen(false);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between border border-border bg-white text-xs text-left transition-colors focus:outline-none focus:ring-1 focus:ring-navy hover:border-slate-400",
            size === "sm" ? "h-8 px-2.5 rounded-md" : "h-9 px-3 rounded-lg",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
            className
          )}
        >
          <span
            className={cn(
              "truncate pr-2",
              selectedOption && selectedOption.value !== ""
                ? "text-foreground font-medium"
                : selectedOption && selectedOption.value === ""
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
              open && "rotate-180 text-navy"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[230px] max-w-[440px] p-0 shadow-lg border border-border rounded-xl bg-white overflow-hidden"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-2.5 py-2 border-b border-border/70 bg-slate-50/70">
          <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/30">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option, idx) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={`${option.value}_${idx}`}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-navy/5 text-navy font-semibold"
                      : "text-foreground hover:bg-slate-100 hover:text-navy",
                    option.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <div className="flex flex-col truncate pr-2 min-w-0">
                    <span className="truncate text-xs">{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[10px] text-muted-foreground font-normal truncate">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-teal shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
