import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { User, Calendar, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import type { SerializedSalesOrder } from "../types";

export function SoCustomerCard({ order }: { order: SerializedSalesOrder }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-navy" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Customer Details
            </h3>
          </div>
          <Link
            href={`/contacts/${order.customer.id}`}
            className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
          >
            View Profile <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-sm text-foreground">{order.customer.name}</p>
          {order.customer.email && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
              {order.customer.email}
            </p>
          )}
          {order.customer.phone && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
              {order.customer.phone}
            </p>
          )}
          {order.customer.address && (
            <p className="text-muted-foreground flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5" />
              <span>{order.customer.address}</span>
            </p>
          )}
          {order.customer.gstin && (
            <p className="text-muted-foreground pt-1">
              <span className="font-medium text-foreground">GSTIN:</span> {order.customer.gstin}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Calendar className="h-4 w-4 text-navy" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Order Schedule & Fulfillment
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Order Booking Date</span>
            <span className="font-medium text-foreground">
              {new Date(order.orderDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Expected Delivery</span>
            <span className="font-medium text-foreground">
              {order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not Specified"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Booked By</span>
            <span className="font-medium text-foreground">
              {order.createdBy?.name || order.createdBy?.email || "Admin"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Internal Reference</span>
            <span className="font-mono font-medium text-navy">{order.soNumber}</span>
          </div>
        </div>

        {order.notes && (
          <div className="pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground block font-medium">Order Notes</span>
            <p className="text-xs text-foreground mt-0.5 bg-[#F9FAFB] p-2 rounded-lg border border-border">
              {order.notes}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
