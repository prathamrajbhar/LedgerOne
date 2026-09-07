"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
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
import type { MonthlyOverviewData } from "@/app/actions/dashboard.actions";

export type ChartPeriod = "Last 6 Months" | "Last 12 Months" | "Year to Date";

interface MonthlyOverviewChartProps {
  overviewData: MonthlyOverviewData[];
  chartPeriod: ChartPeriod;
  isOverviewLoading: boolean;
  onPeriodChange: (period: ChartPeriod) => void;
}

export function MonthlyOverviewChart({
  overviewData,
  chartPeriod,
  isOverviewLoading,
  onPeriodChange,
}: MonthlyOverviewChartProps) {
  return (
    <Card className="lg:col-span-7 p-5 bg-white shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Revenue & Expense Overview
          </CardTitle>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-xs bg-navy" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-xs bg-teal" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full border-2 border-[#54B2B6] bg-white" />
              <span className="text-muted-foreground">Profit</span>
            </div>
          </div>

          {/* Period Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5 disabled:opacity-60">
                {isOverviewLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-navy" />
                )}
                <span>{chartPeriod}</span>
                <span className="text-muted-foreground">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPeriodChange("Last 6 Months")}>
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange("Last 12 Months")}>
                Last 12 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange("Year to Date")}>
                Year to Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-[280px] w-full pt-4 relative">
        {isOverviewLoading && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={overviewData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E7EC" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#E2E7EC" }}
              tick={{ fill: "#5E6B78", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5E6B78", fontSize: 11 }}
              tickFormatter={(val: number) => `₹${val / 100000}L`}
            />
            <RechartsTooltip
              formatter={(value) => [
                `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                "",
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E2E7EC",
                boxShadow: "0 4px 12px rgba(22, 50, 79, 0.08)",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="revenue"
              fill="#16324F"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              fill="#167C80"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#54B2B6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#FFFFFF", stroke: "#54B2B6", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
