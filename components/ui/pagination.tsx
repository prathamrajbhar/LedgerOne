import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-muted-foreground",
        className
      )}
    >
      <div>
        {totalItems ? (
          <span>
            Showing <strong className="text-foreground">{startItem}</strong> to{" "}
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground">{currentPage}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            return (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            );
          })
          .map((page, index, array) => {
            const prev = array[index - 1];
            const showEllipsis = prev && page - prev > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-1 text-muted-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "secondary"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    currentPage === page && "bg-navy text-white hover:bg-navy"
                  )}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            );
          })}

        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
