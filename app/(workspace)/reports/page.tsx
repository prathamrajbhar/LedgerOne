import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Scale,
  PieChart,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  BookOpen,
} from "lucide-react";

export default function ReportsHubPage() {
  const reportCategories = [
    {
      category: "Statutory & Financial Statements",
      description: "Auditable financial reporting adhering to GAAP and double-entry accounting.",
      reports: [
        {
          title: "Balance Sheet",
          description: "Summary of assets, liabilities, and owners' equity as of a specific date.",
          href: "/reports/balance-sheet",
          icon: Scale,
          tag: "Core Financial",
        },
        {
          title: "Profit & Loss Statement",
          description: "Revenue, cost of goods sold, operating expenses, and net profit for a period.",
          href: "/reports/profit-loss",
          icon: TrendingUp,
          tag: "Core Financial",
        },
        {
          title: "General Financial Statements",
          description: "Combined multi-statement view with unified fiscal period analysis.",
          href: "/financial-reports",
          icon: FileSpreadsheet,
          tag: "Executive View",
        },
      ],
    },
    {
      category: "Management & Performance Accounting",
      description: "Internal tracking, departmental allocations, and cost center management.",
      reports: [
        {
          title: "Budget Performance Report",
          description: "Analytic line-by-line comparison of committed targets versus achieved actuals.",
          href: "/reports/budget-report",
          icon: PieChart,
          tag: "Budgeting",
        },
        {
          title: "Inventory Stock Valuation",
          description: "Restock alerts, stock on hand, and reorder point threshold analysis.",
          href: "/inventory",
          icon: Boxes,
          tag: "Operations",
        },
      ],
    },
    {
      category: "Audit & Ledger Logs",
      description: "Detailed chronological journals and general ledger transaction records.",
      reports: [
        {
          title: "General Ledger / Transactions",
          description: "Inspect every debit and credit posting across all chart of accounts.",
          href: "/transactions",
          icon: Receipt,
          tag: "Audit",
        },
        {
          title: "Chart of Accounts Ledger",
          description: "Account balances, codes, classifications, and system mappings.",
          href: "/accounts",
          icon: BookOpen,
          tag: "Master Data",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Financial & Management Reports"
        description="Access balance sheets, income statements, budget achievement tracking, and audit ledgers."
      />

      <div className="space-y-8">
        {reportCategories.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{group.category}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.reports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.title}
                    className="p-5 bg-white border border-border hover:border-navy/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {report.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-navy transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/60">
                      <Link href={report.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-xs font-semibold text-navy hover:text-navy-dark hover:bg-primary-light/50 p-0 h-8"
                        >
                          <span>Open Report</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
