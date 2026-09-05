"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import { toast } from "sonner";

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Financial Statements & Reports"
        description="Statutory double-entry accounting statements: Profit & Loss, Balance Sheet, and Trial Balance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Statement
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Exporting financial statement to Excel...")}
              className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* P&L Statement Card */}
      <Card className="p-6 bg-white shadow-card">
        <div className="border-b border-border pb-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Statement of Profit & Loss (P&L)
            </h2>
            <p className="text-xs text-muted-foreground">
              For the Period: 01 April 2024 to 30 November 2024 (FY 2024-25)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-light text-navy">
            INR (₹) Standard
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Revenue */}
          <div>
            <div className="flex justify-between font-bold text-sm text-navy pb-1 border-b border-border">
              <span>I. REVENUE FROM OPERATIONS</span>
              <span>₹12,45,000.00</span>
            </div>
            <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
              <div className="flex justify-between">
                <span>Gross Furniture Sales (Retail & Commercial)</span>
                <span className="text-foreground font-medium">₹11,60,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Custom Interior Millwork & Delivery Fees</span>
                <span className="text-foreground font-medium">₹85,000.00</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <div className="flex justify-between font-bold text-sm text-foreground pb-1 border-b border-border">
              <span>II. EXPENSES & COST OF GOODS SOLD</span>
              <span>₹8,32,500.00</span>
            </div>
            <div className="py-2 space-y-1.5 pl-3 text-muted-foreground">
              <div className="flex justify-between">
                <span>Cost of Raw Materials Consumed (Timber, Plywood, Foam)</span>
                <span className="text-foreground font-medium">₹4,80,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Employee Benefit Expenses (Carpentry & Polish Staff)</span>
                <span className="text-foreground font-medium">₹2,15,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Showroom & Factory Rent</span>
                <span className="text-foreground font-medium">₹1,12,500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Depreciation on Woodworking Machinery</span>
                <span className="text-foreground font-medium">₹25,000.00</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="pt-2 border-t-2 border-navy flex justify-between items-center text-base font-bold text-navy">
            <span>NET PROFIT BEFORE TAX (I - II)</span>
            <span className="text-success text-lg">₹4,12,500.00</span>
          </div>
        </div>
      </Card>

      {/* Balance Sheet Summary */}
      <Card className="p-6 bg-white shadow-card">
        <div className="border-b border-border pb-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Balance Sheet Overview
            </h2>
            <p className="text-xs text-muted-foreground">
              As of 30 November 2024
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Assets */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-navy pb-1 border-b border-border">
              ASSETS
            </h3>
            <div className="flex justify-between text-muted-foreground">
              <span>Bank & Cash Balances</span>
              <span className="text-foreground font-medium">₹18,60,000.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Trade Receivables (Sundry Debtors)</span>
              <span className="text-foreground font-medium">₹3,25,000.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Inventories (Finished Furniture & Timber)</span>
              <span className="text-foreground font-medium">₹18,40,000.00</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground text-sm">
              <span>TOTAL ASSETS</span>
              <span className="text-navy font-bold">₹40,25,000.00</span>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-navy pb-1 border-b border-border">
              LIABILITIES & EQUITY
            </h3>
            <div className="flex justify-between text-muted-foreground">
              <span>Trade Payables (Wood & Hardware Vendors)</span>
              <span className="text-foreground font-medium">₹1,87,500.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST & Statutory Taxes Payable</span>
              <span className="text-foreground font-medium">₹64,200.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Owner Capital & Retained Earnings</span>
              <span className="text-foreground font-medium">₹37,73,300.00</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground text-sm">
              <span>TOTAL LIABILITIES & EQUITY</span>
              <span className="text-navy font-bold">₹40,25,000.00</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
