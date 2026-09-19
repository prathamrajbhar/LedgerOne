"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package, Check, Loader2, BellOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  getSystemNotificationsAction,
  SystemNotification,
} from "@/app/actions/notification.actions";

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<SystemNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSystemNotificationsAction();
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError(result.error || "Failed to load notifications");
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = () => {
    setNotifications([]);
    toast.success("All system notifications marked as read.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="System Notifications & Alerts"
        description="Live accounting alerts, safety reorder warnings, and overdue payment deadlines."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadNotifications}
              disabled={loading}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={loading || notifications.length === 0}
              className="text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Mark All as Read
            </Button>
          </div>
        }
      />

      {loading && (
        <Card className="p-12 bg-white shadow-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground">Scanning live system alerts...</p>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-6 bg-white shadow-card">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold text-xs">Failed to load alerts</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Card className="p-12 bg-white shadow-card text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center mb-1">
              <BellOff className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Urgent Alerts</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              All customer invoices, vendor bills, and product inventory thresholds are currently in healthy standing.
            </p>
          </div>
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className="p-4 bg-white shadow-card hover:border-navy transition-all"
            >
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
                    <Link
                      href={n.link}
                      className="text-xs font-semibold text-teal hover:underline"
                    >
                      View Record →
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
