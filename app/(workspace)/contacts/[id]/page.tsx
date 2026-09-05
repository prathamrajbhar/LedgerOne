import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  // Mock data for contact
  const contact = {
    id: params.id,
    name: "Modern Living Interiors Pvt Ltd",
    type: "CUSTOMER",
    email: "procurement@modernliving.in",
    phone: "+91 98201 44556",
    address: "Bandra Kurla Complex, Commercial Tower B, Mumbai, MH - 400051",
    gstin: "27AAAAA1234A1Z5",
    totalPurchased: 485000,
    outstandingBalance: 125000,
    creditLimit: 300000,
    portalStatus: "Active",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <PageHeader
        title={contact.name}
        description={`Customer Record ID: ${contact.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/sales/invoices/new">
              <Button size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Create Invoice
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Outstanding Balance</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{contact.outstandingBalance.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-destructive font-medium mt-0.5 block">1 Invoice Due</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Lifetime Business</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{contact.totalPurchased.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-success font-medium mt-0.5 block">6 Completed Orders</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Credit Limit</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{contact.creditLimit.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-teal font-medium mt-0.5 block">₹1,75,000 Available</span>
        </Card>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 bg-white shadow-card">
          <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
            Contact Information
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold text-foreground">{contact.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold text-foreground">{contact.phone}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">Address:</span>
              <span className="font-semibold text-foreground leading-relaxed">{contact.address}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white shadow-card">
          <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
            Tax & Portal Access
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">GSTIN / Identification</span>
              <span className="font-semibold text-foreground font-mono">{contact.gstin}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Portal Status</span>
              <Badge variant="success" className="text-[10px] mt-0.5">
                {contact.portalStatus}
              </Badge>
            </div>
            <div className="pt-2">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs w-full">
                <Send className="h-3.5 w-3.5" />
                Resend Portal Login Details
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
