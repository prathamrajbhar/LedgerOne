"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save } from "lucide-react";
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
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    type: initialData?.type || "CUSTOMER",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <PageHeader
        title={isEdit ? `Edit: ${formData.name}` : "Create New Contact"}
        description="Register a new customer, furniture supplier, or interior design client."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Basic Information
            </CardTitle>
            <CardDescription>
              Primary business identity and relationship classification
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Contact & Address Details
            </CardTitle>
            <CardDescription>
              Official address for invoice delivery and portal access
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 space-y-4">
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

              <FormInput
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <FormTextarea
              label="Physical & Billing Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full office / showroom address..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/contacts">
            <Button type="button" variant="secondary" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-navy hover:bg-navy-hover text-white gap-1.5"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Contact"}
          </Button>
        </div>
      </form>
    </div>
  );
}
