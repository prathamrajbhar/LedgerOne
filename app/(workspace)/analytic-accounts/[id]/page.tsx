import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp, Layers } from "lucide-react";

export default async function AnalyticAccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const account = await prisma.analyticAccount.findUnique({
    where: { id: params.id },
    include: {
      budgetLines: {
        include: {
          budget: true,
        },
      },
      invoiceLines: {
        include: {
          invoice: true,
          product: true,
        },
        take: 10,
        orderBy: { id: "desc" },
      },
      vendorBillLines: {
        include: {
          vendorBill: true,
          product: true,
        },
        take: 10,
        orderBy: { id: "desc" },
      },
    },
  });

  if (!account) {
    notFound();
  }

  let totalCommitted = 0;
  let totalAchieved = 0;
  account.budgetLines.forEach((l) => {
    totalCommitted += Number(l.committedAmount);
    totalAchieved += Number(l.achievedAmount);
  });

  const utilPercent = totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="space-y-3">
        <Link
          href="/analytic-accounts"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Analytic Accounts
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-navy">
                {account.name}
              </h1>
              <Badge variant="outline" className="text-xs bg-[#F6F7F9]">
                {account.type === "INCOME" ? "Revenue / Project Center" : "Cost / Expense Center"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Financial performance, operational costs, and budget tracking for this cost unit.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Planned Budget Target</span>
            <span className="text-lg font-bold text-foreground">
              ₹{totalCommitted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Actual Realized Volume</span>
            <span className="text-lg font-bold text-foreground">
              ₹{totalAchieved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6] text-warning flex-shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Budget Consumption</span>
            <span className="text-lg font-bold text-foreground">{utilPercent}%</span>
          </div>
        </Card>
      </div>

      {/* Linked Budget Targets Table */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Assigned Department Budgets</h3>
            <p className="text-xs text-muted-foreground">
              Budgetary periods and thresholds defined for this analytic center.
            </p>
          </div>
        </div>

        {account.budgetLines.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No budgets assigned to this analytic account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                  <th className="py-2.5 px-3">Budget Plan</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3 text-right">Committed (₹)</th>
                  <th className="py-2.5 px-3 text-right">Achieved (₹)</th>
                  <th className="py-2.5 px-3 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {account.budgetLines.map((l) => (
                  <tr key={l.id} className="hover:bg-primary-light/20">
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      <Link href={`/budgets/${l.budget.id}`} className="hover:text-navy hover:underline">
                        {l.budget.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(l.budget.startDate).toLocaleDateString("en-IN")} -{" "}
                      {new Date(l.budget.endDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{Number(l.committedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                      ₹{Number(l.achievedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className="text-[10px]">
                        {Number(l.achievedPercent).toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
