import * as React from "react";
import { Card } from "@/components/ui/card";

interface ExpensesKpiStripProps {
  totalExpenses: number;
  count: number;
}

export function ExpensesKpiStrip({ totalExpenses, count }: ExpensesKpiStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 bg-white shadow-card">
        <span className="text-xs text-muted-foreground font-medium">Total Recorded Expenses</span>
        <p className="text-xl font-bold text-navy mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
        <span className="text-[11px] text-muted-foreground block mt-0.5">Across {count} transactions</span>
      </Card>
      <Card className="p-4 bg-white shadow-card">
        <span className="text-xs text-muted-foreground font-medium">This Month</span>
        <p className="text-xl font-bold text-navy mt-1">₹{totalExpenses.toLocaleString("en-IN")}</p>
        <span className="text-[11px] text-muted-foreground block mt-0.5">Operating overheads</span>
      </Card>
      <Card className="p-4 bg-white shadow-card">
        <span className="text-xs text-muted-foreground font-medium">Average Expense</span>
        <p className="text-xl font-bold text-teal mt-1">
          ₹{count > 0 ? Math.round(totalExpenses / count).toLocaleString("en-IN") : "0"}
        </p>
        <span className="text-[11px] text-teal block mt-0.5">Per transaction</span>
      </Card>
    </div>
  );
}
