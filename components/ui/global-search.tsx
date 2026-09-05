"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Building,
  Package,
  FileText,
  Receipt,
  BookOpen,
  ArrowRight,
  Compass,
  Loader2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  globalSearchAction,
  SearchResultItem,
} from "@/app/actions/global-search.actions";

const CATEGORY_ICONS = {
  Customers: User,
  Vendors: Building,
  Products: Package,
  Invoices: FileText,
  Bills: Receipt,
  Accounts: BookOpen,
  "Pages & Actions": Compass,
};

const CATEGORIES = [
  "All",
  "Customers",
  "Vendors",
  "Invoices",
  "Bills",
  "Products",
  "Accounts",
] as const;

type FilterCategory = (typeof CATEGORIES)[number];

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<FilterCategory>("All");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Load results whenever query changes with 220ms debounce
  React.useEffect(() => {
    if (!open) return;

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await globalSearchAction(query);
        if (res.success && res.data) {
          setResults(res.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, open]);

  // Filter items by selected category tab
  const filteredResults = React.useMemo(() => {
    if (activeCategory === "All") return results;
    return results.filter((item) => item.category === activeCategory);
  }, [results, activeCategory]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  // Keyboard arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        handleSelect(target.href);
      }
    }
  };

  const getBadgeClasses = (variant?: SearchResultItem["badgeVariant"]) => {
    switch (variant) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "destructive":
        return "bg-red-50 text-red-700 border-red-200";
      case "default":
        return "bg-blue-50 text-navy border-blue-200";
      case "outline":
      default:
        return "bg-surface-subtle text-muted-foreground border-border";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="p-0 max-w-2xl overflow-hidden shadow-2xl border border-border">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-border bg-white">
          {loading ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin mr-3 flex-shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search customers, vendors, invoices, bills, products, accounts..."
            className="w-full py-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground mr-2 rounded-md hover:bg-surface-subtle"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground bg-surface-subtle hover:bg-slate-200/80 border border-border rounded transition-colors flex-shrink-0"
            title="Close dialog (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFBFC] border-b border-border/80 overflow-x-auto text-xs no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = cat === "All" ? results.length : results.filter((r) => r.category === cat).length;
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-navy text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-200/60"
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-border text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">No matching records found</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {query
                  ? `No entries matched "${query}". Try searching by customer name, bill/invoice ID, SKU, or GL code.`
                  : "Start typing to search live database records."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>
                  {query ? `Search Results (${filteredResults.length})` : "Quick Navigation & Common Records"}
                </span>
                <span className="text-[10px] font-normal lowercase">Use ↑ ↓ and Enter</span>
              </div>
              {filteredResults.map((item, idx) => {
                const Icon = CATEGORY_ICONS[item.category] || Compass;
                const isFocused = idx === selectedIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors group ${
                      isFocused ? "bg-primary-light/70" : "hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                          isFocused
                            ? "bg-navy text-white"
                            : "bg-surface-subtle text-muted-foreground group-hover:text-navy group-hover:bg-primary-light"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium truncate ${
                              isFocused ? "text-navy font-semibold" : "text-foreground"
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getBadgeClasses(
                                item.badgeVariant
                              )}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        {item.category}
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 text-muted-foreground transition-opacity ${
                          isFocused ? "opacity-100 text-navy" : "opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#FAFBFC] border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Search live: <strong className="text-foreground">Contacts</strong>,{" "}
              <strong className="text-foreground">Invoices</strong>,{" "}
              <strong className="text-foreground">Bills</strong>,{" "}
              <strong className="text-foreground">Products</strong>,{" "}
              <strong className="text-foreground">Accounts</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>Navigate</span>
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-white border border-border rounded">↑</kbd>
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-white border border-border rounded">↓</kbd>
            <span>Select</span>
            <kbd className="px-1.5 py-0.5 font-mono text-[9px] bg-white border border-border rounded">↵</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
