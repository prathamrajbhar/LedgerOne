"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { ArrowLeft, Save, Users, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createContactAction, updateContactAction } from "@/app/actions/contact.actions";
import { ContactType } from "@prisma/client";

export interface ContactFormDataShape {
  id?: string;
  name?: string;
  type?: "CUSTOMER" | "VENDOR" | "BOTH";
  email?: string;
  phone?: string;
  address?: string;
}

interface ContactFormProps {
  initialData?: ContactFormDataShape;
  isEdit?: boolean;
}

export function ContactForm({ initialData, isEdit }: ContactFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type")?.toUpperCase();
  const defaultType =
    initialData?.type ||
    (urlType === "CUSTOMER" || urlType === "VENDOR" ? urlType : "CUSTOMER");

  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    type: defaultType as "CUSTOMER" | "VENDOR" | "BOTH",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

  const backUrl =
    formData.type === "CUSTOMER"
      ? "/contacts?type=CUSTOMER"
      : formData.type === "VENDOR"
      ? "/contacts?type=VENDOR"
      : "/contacts";

  const entityTitle =
    formData.type === "CUSTOMER"
      ? "Customer"
      : formData.type === "VENDOR"
      ? "Vendor / Supplier"
      : "Contact";

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Basic client-side validation
    if (!formData.name.trim()) newErrors.name = "Full name / business name is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the form validation errors");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare contact data
      const contactData = {
        name: formData.name.trim(),
        type: formData.type as ContactType,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      let result;
      if (isEdit && initialData?.id) {
        // Update existing contact
        result = await updateContactAction({
          id: initialData.id,
          ...contactData,
        });
      } else {
        // Create new contact
        result = await createContactAction(contactData);
      }

      if (result.success) {
        toast.success(
          isEdit
            ? `Contact "${formData.name}" updated successfully.`
            : `Contact "${formData.name}" created successfully.`
        );
        router.push("/contacts");
        router.refresh(); // Refresh the contacts list
      } else {
        // Handle backend validation errors
        toast.error(result.error || "Failed to save contact");

        // Map specific field errors if available
        if (result.error?.includes("email")) {
          setErrors({ email: result.error });
        } else if (result.error?.includes("name")) {
          setErrors({ name: result.error });
        }
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link href={backUrl}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to {entityTitle}s
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground bg-white/80 px-2.5 py-1 rounded-full border border-border">
          {isEdit ? `Editing ${entityTitle}` : `New ${entityTitle} Entry`}
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EBF3F9] text-navy flex items-center justify-center flex-shrink-0 border border-navy/10">
            {formData.type === "VENDOR" ? (
              <Building2 className="h-6 w-6 text-navy" />
            ) : (
              <Users className="h-6 w-6 text-navy" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
                {isEdit ? `Edit: ${formData.name}` : `Create New ${entityTitle}`}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E3F3F3] text-[#167C80]">
                {entityTitle}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.type === "CUSTOMER"
                ? "Register client details, delivery addresses, and billing credentials for portal access."
                : formData.type === "VENDOR"
                ? "Register timber sawmills, upholstery vendors, hardware fittings suppliers, and payment terms."
                : "Register customers, suppliers, raw material vendors, and partner accounts."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <Link href="/contacts">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            size="sm"
            className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4"
          >
            <Save className="h-3.5 w-3.5" />
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Contact"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
          <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-navy" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Entity Profile & Relationship Type
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Primary business identity and relationship classification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Contact / Company Name"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g. Modern Living Interiors Pvt Ltd"
              error={errors.name}
            />

            <FormSelect
              label="Contact Type"
              required
              value={formData.type}
              onValueChange={(val) => setFormData({ ...formData, type: val as "CUSTOMER" | "VENDOR" | "BOTH" })}
              options={[
                { value: "CUSTOMER", label: "Customer (Sales Invoices & Receipts)" },
                { value: "VENDOR", label: "Supplier / Vendor (Purchases & Bills)" },
                { value: "BOTH", label: "Both Customer & Vendor" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Section 2: Contact & Communication */}
        <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
          <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#E3F3F3] text-[#167C80] flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-[#167C80]" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Communication & Billing Address
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Official contact details for invoice dispatch, statements, and shipment delivery.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Email Address (Portal & Invoices)"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="billing@company.com"
                error={errors.email}
              />

              <PhoneInput
                label="Phone Number"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="98765 43210"
              />
            </div>

            <FormTextarea
              label="Physical & Billing Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full office, showroom, or warehouse address..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Link href="/contacts">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4"
          >
            <Save className="h-3.5 w-3.5" />
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Contact"}
          </Button>
        </div>
      </form>
    </div>
  );
}
