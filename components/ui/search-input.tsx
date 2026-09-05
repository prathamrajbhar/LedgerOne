import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (value: string) => void;
  shortcut?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearchChange, shortcut, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-14 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:border-navy transition-colors",
            className
          )}
          ref={ref}
          onChange={(e) => {
            props.onChange?.(e);
            onSearchChange?.(e.target.value);
          }}
          {...props}
        />
        {shortcut && (
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="inline-flex h-5 items-center rounded border border-border bg-surface-subtle px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              {shortcut}
            </kbd>
          </div>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
