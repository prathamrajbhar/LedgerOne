"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  Save,
  Loader2,
  User,
  Shield,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Mail,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  updateUserAction,
  resendContactPortalInvitationAction,
  toggleUserStatusAction,
} from "@/app/actions/user-management.actions";

interface EditUserFormProps {
  initialUser: {
    id: string;
    loginId: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    mustChangePassword: boolean;
    contact?: { id: string; name: string; type: string; email: string; phone?: string | null } | null;
  };
  currentUserId: string;
}

export function EditUserForm({ initialUser, currentUserId }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [toggling, setToggling] = React.useState(false);

  const [name, setName] = React.useState(initialUser.name || "");
  const [email, setEmail] = React.useState(initialUser.email);
  const [role, setRole] = React.useState<UserRole>(initialUser.role);
  const [isActive, setIsActive] = React.useState<boolean>(initialUser.isActive);

  const isSelf = currentUserId === initialUser.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in required fields (Name & Email)");
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserAction({
        userId: initialUser.id,
        name: name.trim(),
        email: email.trim(),
        role,
        isActive: isSelf ? true : isActive,
      });

      if (res.success) {
        toast.success(`User profile for ${name} updated successfully!`);
        router.push("/users");
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to update user profile");
    } catch {
      toast.error("An unexpected error occurred while saving changes");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const res = await resendContactPortalInvitationAction(initialUser.id);
      if (res.success && res.data) {
        const inv = res.data as { emailSent: boolean; emailError?: string };
        if (inv.emailSent) {
          toast.success(`Portal invitation email resent to ${email}!`);
        } else {
          toast.warning(`Credentials reset, but email failed: ${inv.emailError || "Check SMTP"}`);
        }
        return;
      }
      toast.error(res.error || "Failed to resend portal email");
    } catch {
      toast.error("An error occurred while sending email");
    } finally {
      setResending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (isSelf) return;

    setToggling(true);
    try {
      const nextStatus = !isActive;
      const res = await toggleUserStatusAction(initialUser.id, nextStatus);
      if (res.success) {
        setIsActive(nextStatus);
        toast.success(`Account access set to ${nextStatus ? "Active" : "Inactive"}`);
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to change user status");
    } catch {
      toast.error("An error occurred while updating status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Edit User Profile
            </h1>
            <span className="font-mono text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
              {initialUser.loginId}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Update user information, assign system roles, and manage account access.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Resend Email Action for Portal Users */}
          {role === UserRole.CONTACT && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={resending}
              onClick={handleResendEmail}
              className="h-9 text-xs px-3 gap-1.5 border-teal/40 text-teal hover:bg-teal/5 cursor-pointer"
              title="Resend invitation email with new temporary password"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-teal" />
              )}
              Resend Email
            </Button>
          )}

          {/* Quick Deactivate / Activate Toggle */}
          {!isSelf && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={toggling}
              onClick={handleToggleStatus}
              className={`h-9 text-xs px-3 gap-1.5 cursor-pointer ${
                isActive
                  ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
              title={isActive ? "Deactivate user access" : "Activate user access"}
            >
              {toggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
            disabled={loading}
            className="h-9 text-xs px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="h-9 text-xs px-4 bg-navy hover:bg-navy-dark text-white font-medium gap-1.5 cursor-pointer shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
            <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-navy" /> General Profile Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Login ID (System Generated)</label>
                <input
                  type="text"
                  disabled
                  value={initialUser.loginId}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-slate-100 text-muted-foreground font-mono font-medium"
                />
              </div>

              <FormInput
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@company.com"
            />
          </Card>

          {/* Section 2: System Role & Status */}
          <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
            <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-navy" /> Authorization & Access Level
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="System Role"
                value={role}
                onValueChange={(val) => setRole(val as UserRole)}
                options={[
                  { value: UserRole.ADMINISTRATOR, label: "Administrator (Full Access)" },
                  { value: UserRole.ACCOUNTANT, label: "Accountant (Staff Access)" },
                  { value: UserRole.CONTACT, label: "Portal User (Client / Vendor)" },
                ]}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Account Status</label>
                <select
                  disabled={isSelf}
                  value={isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-navy disabled:bg-slate-100 disabled:text-muted-foreground"
                >
                  <option value="ACTIVE">Active (Access Allowed)</option>
                  <option value="INACTIVE">Inactive (Access Suspended)</option>
                </select>
                {isSelf && (
                  <p className="text-[10px] text-amber-700 font-medium">
                    You cannot deactivate your own logged-in administrator account.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Associated Entity */}
        <div className="space-y-6">
          <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-4">
            <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-navy" /> Associated Entity
            </div>

            {initialUser.contact ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Linked Contact:</span>
                  <div className="font-semibold text-foreground mt-0.5">{initialUser.contact.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity Type:</span>
                  <div className="font-medium text-navy mt-0.5">{initialUser.contact.type}</div>
                </div>
                {initialUser.contact.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="font-medium text-foreground mt-0.5">{initialUser.contact.phone}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-muted-foreground">
                Internal Staff Account (No external customer or vendor contact linked).
              </div>
            )}
          </Card>

          <Card className="p-5 bg-white border border-border rounded-xl shadow-2xs space-y-3 text-xs">
            <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-navy" /> Account Metadata
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-muted-foreground">Created On</span>
              <span className="font-medium text-foreground">
                {new Date(initialUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1 font-semibold">
                {isActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-red-700">Inactive</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Must Reset Pwd</span>
              <span className="font-medium text-foreground">
                {initialUser.mustChangePassword ? "Yes" : "No"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
