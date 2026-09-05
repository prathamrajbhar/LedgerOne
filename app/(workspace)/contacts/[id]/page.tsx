import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getContactByIdAction } from "@/app/actions/contact.actions";
import { notFound } from "next/navigation";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const result = await getContactByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const contact = result.data;

  // TODO: Calculate these from actual transactions when implemented
  const totalPurchased = 0;
  const outstandingBalance = 0;
  const creditLimit = 0;

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
        description={`${contact.type === "CUSTOMER" ? "Customer" : contact.type === "VENDOR" ? "Vendor" : "Customer & Vendor"} Record ID: ${contact.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </Link>
            {(contact.type === "CUSTOMER" || contact.type === "BOTH") && (
              <Link href="/invoices">
                <Button size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Create Invoice
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Outstanding Balance</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{outstandingBalance.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
            {outstandingBalance > 0 ? "Invoices/Bills Due" : "No Outstanding"}
          </span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Lifetime Business</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{totalPurchased.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
            {totalPurchased > 0 ? "Completed Orders" : "No Orders Yet"}
          </span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Credit Limit</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{creditLimit.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
            {creditLimit > 0 ? "Available Credit" : "Not Set"}
          </span>
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
            {contact.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold text-foreground">{contact.phone}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Address:</span>
                <span className="font-semibold text-foreground leading-relaxed">{contact.address}</span>
              </div>
            )}
            {!contact.phone && !contact.address && (
              <p className="text-muted-foreground italic">No additional contact details available</p>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white shadow-card">
          <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
            Account Details
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Contact Type</span>
              <Badge
                variant={contact.type === "CUSTOMER" ? "default" : contact.type === "VENDOR" ? "secondary" : "outline"}
                className="text-[10px] mt-0.5"
              >
                {contact.type === "CUSTOMER" ? "Customer" : contact.type === "VENDOR" ? "Vendor" : "Customer & Vendor"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Portal Status</span>
              <Badge
                variant={contact.user?.isActive ? "success" : "secondary"}
                className="text-[10px] mt-0.5"
              >
                {contact.user?.isActive ? "Active" : "No Portal Access"}
              </Badge>
            </div>
            {contact.user && (
              <div className="pt-2">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs w-full">
                  <Send className="h-3.5 w-3.5" />
                  Resend Portal Login Details
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
