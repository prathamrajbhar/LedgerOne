import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Building2, Calendar, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import type { SerializedPurchaseOrder } from "../types";

export function PoVendorCard({ po }: { po: SerializedPurchaseOrder }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-navy" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Vendor / Supplier Details
            </h3>
          </div>
          <Link
            href={`/contacts/${po.vendor.id}`}
            className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
          >
            Vendor Profile <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-sm text-foreground">{po.vendor.name}</p>
          {po.vendor.email && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
              {po.vendor.email}
            </p>
          )}
          {po.vendor.phone && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
              {po.vendor.phone}
            </p>
          )}
          {po.vendor.address && (
            <p className="text-muted-foreground flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5" />
              <span>{po.vendor.address}</span>
            </p>
          )}
          {po.vendor.gstin && (
            <p className="text-muted-foreground pt-1">
              <span className="font-medium text-foreground">GSTIN:</span> {po.vendor.gstin}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Calendar className="h-4 w-4 text-navy" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Procurement Schedule & Details
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">PO Date</span>
            <span className="font-medium text-foreground">
              {new Date(po.orderDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Procurement Officer</span>
            <span className="font-medium text-foreground">
              {po.createdBy?.name || po.createdBy?.email || "Procurement Dept"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">PO Number</span>
            <span className="font-mono font-medium text-navy">{po.poNumber}</span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Status</span>
            <span className="font-medium text-foreground">{po.status}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
