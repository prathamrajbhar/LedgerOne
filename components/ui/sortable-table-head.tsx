import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface SortState<T extends string = string> {
  column: T | null;
  direction: SortDirection;
}

interface SortableTableHeadProps<T extends string = string>
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  columnKey: T;
  currentSort: SortState<T>;
  onSort: (column: T) => void;
  title?: string;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}

export function SortableTableHead<T extends string = string>({
  columnKey,
  currentSort,
  onSort,
  align = "left",
  className,
  children,
  ...props
}: SortableTableHeadProps<T>) {
  const isActive = currentSort.column === columnKey;
  const direction = isActive ? currentSort.direction : null;

  return (
    <th
      className={cn(
        "py-3 px-4 font-semibold text-[11px] uppercase tracking-wider select-none cursor-pointer transition-colors hover:text-navy hover:bg-slate-100/70",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        isActive && "text-navy font-bold bg-slate-100/50",
        className
      )}
      onClick={() => onSort(columnKey)}
      {...props}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 group",
          align === "right" && "justify-end flex-row-reverse",
          align === "center" && "justify-center"
        )}
      >
        <span>{children}</span>
        <span
          className={cn(
            "p-0.5 rounded transition-colors",
            isActive ? "text-teal bg-teal/10" : "text-muted-foreground/40 group-hover:text-muted-foreground"
          )}
        >
          {direction === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : direction === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  );
}

/**
 * Universal client-side sort hook
 */
export function useTableSort<T, K extends string = string>(
  items: T[],
  defaultColumn: K | null = null,
  defaultDirection: SortDirection = "asc",
  customAccessors?: Partial<Record<K, (item: T) => string | number | Date | boolean | null | undefined>>
) {
  const [sortState, setSortState] = React.useState<SortState<K>>({
    column: defaultColumn,
    direction: defaultDirection,
  });

  const handleSort = React.useCallback((column: K) => {
    setSortState((prev) => {
      if (prev.column === column) {
        if (prev.direction === "asc") return { column, direction: "desc" };
        if (prev.direction === "desc") return { column: null, direction: null };
        return { column, direction: "asc" };
      }
      return { column, direction: "asc" };
    });
  }, []);

  const sortedItems = React.useMemo(() => {
    if (!sortState.column || !sortState.direction) return items;

    const { column, direction } = sortState;
    const modifier = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      let valA: unknown;
      let valB: unknown;

      if (customAccessors && customAccessors[column]) {
        valA = customAccessors[column]!(a);
        valB = customAccessors[column]!(b);
      } else {
        valA = (a as Record<string, unknown>)[column];
        valB = (b as Record<string, unknown>)[column];
      }

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (valA instanceof Date && valB instanceof Date) {
        return (valA.getTime() - valB.getTime()) * modifier;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * modifier;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return strA.localeCompare(strB, undefined, { numeric: true }) * modifier;
    });
  }, [items, sortState, customAccessors]);

  return {
    sortedItems,
    sortState,
    handleSort,
    setSortState,
  };
}
