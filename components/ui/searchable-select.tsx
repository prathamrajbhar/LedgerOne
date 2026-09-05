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
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

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

  React.useEffect(() => {
    if (open) {
      setHighlightedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  // Reset highlight index when search changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Handle native wheel event to guarantee smooth scrolling inside dialogs
  React.useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || !open) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    listEl.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      listEl.removeEventListener("wheel", handleWheel);
    };
  }, [open]);

  // Scroll highlighted item into view
  const scrollItemIntoView = (index: number) => {
    const item = itemRefs.current[index];
    if (item && listRef.current) {
      item.scrollIntoView({ block: "nearest" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : prev;
        scrollItemIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        scrollItemIntoView(next);
        return next;
      });
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      const target = filteredOptions[highlightedIndex] || filteredOptions.find((opt) => !opt.disabled);
      if (target && !target.disabled) {
        onChange(target.value);
        setOpen(false);
      }
    }
  };

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
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
        className="w-[var(--radix-popover-trigger-width)] min-w-[230px] max-w-[440px] p-0 shadow-xl border border-border rounded-xl bg-white overflow-hidden z-[100]"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-2.5 py-2 border-b border-border/70 bg-slate-50/80 sticky top-0 z-10">
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

        {/* Options List with guaranteed mouse wheel and touch scroll */}
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto p-1 divide-y divide-border/30 overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={`${option.value}_${idx}`}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  disabled={option.disabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-navy/10 text-navy font-semibold"
                      : isHighlighted
                      ? "bg-slate-100 text-foreground"
                      : "text-foreground hover:bg-slate-50",
                    option.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <div className="flex flex-col truncate pr-2 min-w-0">
                    <span className="truncate text-xs">{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">
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
