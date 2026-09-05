"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, AlertTriangle, CheckCircle2, XCircle, Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import {
  getInventoryMetricsAction,
  getRestockAlertsAction,
} from "@/app/actions/product.actions";

interface InventoryMetrics {
  total: number;
  lowStock: number;
  inStock: number;
  outOfStock: number;
}

interface RestockAlert {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderPoint: number;
  status: "LOW_STOCK" | "OUT_OF_STOCK";
}

export default function InventoryPage() {
  const [metrics, setMetrics] = React.useState<InventoryMetrics>({
    total: 0,
    lowStock: 0,
    inStock: 0,
    outOfStock: 0,
  });
  const [alerts, setAlerts] = React.useState<RestockAlert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [metricsResult, alertsResult] = await Promise.all([
        getInventoryMetricsAction(),
        getRestockAlertsAction(),
      ]);

      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data);
      } else {
        toast.error(metricsResult.error || "Failed to load inventory metrics");
      }

      if (alertsResult.success && alertsResult.data) {
        setAlerts(alertsResult.data);
      } else {
        toast.error(alertsResult.error || "Failed to load restock alerts");
      }
    } catch (error) {
      toast.error("Failed to load inventory data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderClick = (productName: string) => {
    toast.success(`Purchase order draft created for "${productName}".`);
  };

  const stockMetrics = [
    {
      label: "Total Products",
      count: metrics.total,
      icon: Boxes,
      color: "text-[#3478B9]",
      bg: "bg-[#EDF5FC]",
    },
    {
      label: "Low Stock",
      count: metrics.lowStock,
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-[#FFF7E6]",
    },
    {
      label: "In Stock",
      count: metrics.inStock,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-[#EAF7F1]",
    },
    {
      label: "Out of Stock",
      count: metrics.outOfStock,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-[#FDEEEE]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Valuation"
        description="Real-time furniture stock counts, warehouse reorder alerts, and safety thresholds."
        actions={
          <Link href="/products/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Stock Item
            </Button>
          </Link>
        }
      />

      {/* 4 Metric Cards Matching Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stockMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-4 bg-white shadow-card flex items-center gap-3.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.bg} ${m.color} flex-shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {m.label}
                </span>
                <span className="text-xl font-bold text-foreground">
                  {loading ? "..." : m.count}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Urgent Attention Table */}
      <Card className="p-5 bg-white shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <h3 className="text-sm font-bold text-foreground">
            Items Requiring Restock (Stock ≤ Reorder Point)
          </h3>
          <span className="text-xs text-warning font-semibold">
            {loading ? "..." : `${alerts.length} items alerted`}
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Loading restock alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No products require restocking.</p>
            <p className="text-xs text-muted-foreground mt-1">
              All products are above their reorder points.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[11px] font-semibold border-b border-border bg-[#F9FAFB]">
                  <th className="py-3 px-4">Item SKU</th>
                  <th className="py-3 px-4">Furniture Model</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Remaining</th>
                  <th className="py-3 px-4 text-center">Reorder Point</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-primary-light/30">
                    <td className="py-3 px-4 font-mono font-bold text-navy">
                      {alert.sku || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {alert.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {alert.category}
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${
                      alert.stock === 0 ? "text-destructive" : "text-warning"
                    }`}>
                      {alert.stock} units
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {alert.reorderPoint} units
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleReorderClick(alert.name)}
                        className="h-7 text-xs bg-navy text-white"
                      >
                        Reorder Now
                      </Button>
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
