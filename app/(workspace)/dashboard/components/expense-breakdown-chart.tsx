"use client";

import * as React from "react";
import { Loader2, Receipt } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExpenseBreakdownItem } from "@/app/actions/dashboard.actions";

export type ExpensePeriod = "This Month" | "Last Month" | "This Quarter" | "All Time";

interface TooltipPayloadEntry {
  payload: ExpenseBreakdownItem;
}

interface ExpenseBreakdownChartProps {
  breakdownData: ExpenseBreakdownItem[];
  expensePeriod: ExpensePeriod;
  isBreakdownLoading: boolean;
  onExpensePeriodChange: (period: ExpensePeriod) => void;
}

export function ExpenseBreakdownChart({
  breakdownData,
  expensePeriod,
  isBreakdownLoading,
  onExpensePeriodChange,
}: ExpenseBreakdownChartProps) {
  const [expenseChartType, setExpenseChartType] = React.useState<"donut" | "bar">("donut");

  const totalExpensesBreakdown = breakdownData.reduce((sum, item) => {
    if (typeof item.rawAmount === "number") {
      return sum + item.rawAmount;
    }
    const numericValue = parseFloat(item.amount.replace(/[₹,]/g, ""));
    return sum + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);

  return (
    <Card className="lg:col-span-5 p-5 bg-white shadow-card flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-border gap-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold text-foreground">
            Expense Breakdown
          </CardTitle>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle between Donut and Bar graph */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setExpenseChartType("donut")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                expenseChartType === "donut"
                  ? "bg-white text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Donut
            </button>
            <button
              type="button"
              onClick={() => setExpenseChartType("bar")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                expenseChartType === "bar"
                  ? "bg-white text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bar
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 px-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1 disabled:opacity-60">
                {isBreakdownLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-teal" />
                )}
                <span>{expensePeriod}</span>
                <span className="text-muted-foreground text-[10px]">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExpensePeriodChange("This Month")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExpensePeriodChange("Last Month")}>
                Last Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExpensePeriodChange("This Quarter")}>
                This Quarter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExpensePeriodChange("All Time")}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {breakdownData.length === 0 ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-sm text-muted-foreground relative">
          {isBreakdownLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal" />
            </div>
          )}
          <Receipt className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <span>No expense data available</span>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Confirmed vendor bills and journal entries will appear here.
          </p>
        </div>
      ) : expenseChartType === "donut" ? (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 relative">
          {isBreakdownLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal" />
            </div>
          )}
          <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {breakdownData.map((item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={item.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val, _name, entry) => {
                    const itemPayload = (entry as unknown as TooltipPayloadEntry).payload;
                    return [`${val ?? 0}% (${itemPayload.amount})`, itemPayload.name];
                  }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E2E7EC",
                    boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
              <span className="text-sm sm:text-base font-extrabold text-[#16324F] tracking-tight">
                ₹{totalExpensesBreakdown.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-medium text-[#5E6B78]">
                Total Expenses
              </span>
            </div>
          </div>

          <div className="w-full flex-1 space-y-1.5 min-w-0 max-h-[220px] overflow-y-auto pr-1">
            {breakdownData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0 hover:bg-muted/30 px-1 rounded transition-colors gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="text-foreground font-medium text-[11px] truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-muted-foreground text-[11px] font-mono whitespace-nowrap">
                    {item.amount}
                  </span>
                  <span className="font-bold text-foreground text-[10px] bg-muted/60 px-1 py-0.5 rounded min-w-[36px] text-right">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col pt-3 relative">
          {isBreakdownLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal" />
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1">
            <span>Category Breakdown</span>
            <span className="font-semibold text-foreground">
              Total: ₹{totalExpensesBreakdown.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={breakdownData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E7EC" />
                <XAxis
                  type="number"
                  domain={[0, "dataMax + 10"]}
                  unit="%"
                  tickLine={false}
                  axisLine={{ stroke: "#E2E7EC" }}
                  tick={{ fill: "#5E6B78", fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tick={{ fill: "#16324F", fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(val: string) =>
                    val.length > 10 ? `${val.slice(0, 9)}…` : val
                  }
                />
                <RechartsTooltip
                  formatter={(value, _name, entry) => {
                    const itemPayload = (entry as unknown as TooltipPayloadEntry).payload;
                    return [`${itemPayload.amount} (${value ?? 0}%)`, itemPayload.name];
                  }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E2E7EC",
                    boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {breakdownData.map((item, index) => (
                    <Cell key={`bar-cell-${index}`} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
