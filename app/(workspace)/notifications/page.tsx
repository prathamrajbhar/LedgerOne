"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NotificationsPage() {
  const notifications = [
    {
      id: "1",
      title: "Invoice Overdue: INV-1085",
      description: "Prestige Executive Suites invoice for ₹2,15,000 has passed the agreed net-30 due date.",
      time: "2 hours ago",
      type: "ALERT",
      link: "/invoices",
    },
    {
      id: "2",
      title: "Critical Inventory Alert: Out of Stock",
      description: "Nordic Solid Oak King Size Bed (FUR-BED-004) has reached 0 units in stock.",
      time: "5 hours ago",
      type: "STOCK",
      link: "/products",
    },
    {
      id: "3",
      title: "Supplier Payment Due in 2 Days",
      description: "WoodMart Timber Supplies bill for ₹48,500 due in 2 business days.",
      time: "1 day ago",
      type: "PAYMENT",
      link: "/purchases",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="System Notifications & Alerts"
        description="Accounting alerts, low-stock warnings, and payment deadlines."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.success("All notifications marked as read.")}
            className="text-xs gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Mark All as Read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className="p-4 bg-white shadow-card hover:border-navy transition-all">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  n.type === "ALERT"
                    ? "bg-[#FDEEEE] text-destructive"
                    : n.type === "STOCK"
                    ? "bg-[#FFF7E6] text-warning"
                    : "bg-[#EDF5FC] text-navy"
                }`}
              >
                {n.type === "ALERT" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : n.type === "STOCK" ? (
                  <Package className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {n.description}
                </p>
                <div className="mt-2">
                  <Link href={n.link} className="text-xs font-semibold text-teal hover:underline">
                    View Record →
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
