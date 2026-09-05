"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, User, Package, FileText, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const searchableItems = [
  { id: "1", title: "Modern Living Interiors", category: "Customers", href: "/contacts", icon: User },
  { id: "2", title: "Royal Oak Furniture Pvt Ltd", category: "Customers", href: "/contacts", icon: User },
  { id: "3", title: "WoodMart Timber Supplies", category: "Suppliers", href: "/contacts", icon: User },
  { id: "4", title: "Teak Wood Dining Table (6-Seater)", category: "Products", href: "/products", icon: Package },
  { id: "5", title: "Ergonomic Office Chair - Executive", category: "Products", href: "/products", icon: Package },
  { id: "6", title: "King Size Velvet Fabric Bed", category: "Products", href: "/products", icon: Package },
  { id: "7", title: "INV-2024-1087 (₹1,25,000.00)", category: "Invoices", href: "/invoices", icon: FileText },
  { id: "8", title: "BILL-2024-056 (₹48,500.00)", category: "Purchases", href: "/purchases", icon: FileText },
  { id: "9", title: "Chart of Accounts - 1010 Bank", category: "Accounts", href: "/accounts", icon: FileText },
];

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

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

  const filtered = searchableItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden shadow-2xl border border-border">
        <div className="flex items-center px-4 border-b border-border bg-white">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, invoices, products, transactions..."
            className="w-full py-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-surface-subtle border border-border rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching records found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Navigation & Records
              </div>
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-primary-light/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-surface-subtle text-muted-foreground group-hover:text-navy group-hover:bg-primary-light">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-navy">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
