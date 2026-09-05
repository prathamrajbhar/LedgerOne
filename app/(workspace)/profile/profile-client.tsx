"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  Calendar,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  UserProfileData,
  updateUserProfileAction,
  updatePasswordAction,
} from "@/app/actions/profile.actions";

interface ProfileClientProps {
  initialProfile: UserProfileData;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  // Profile form state
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  const initials = name.includes(" ")
    ? name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : name.slice(0, 2).toUpperCase() || "U";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateUserProfileAction({
        id: initialProfile.id,
        name,
        email,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update profile.");
        return;
      }

      toast.success("Profile details updated successfully!");
    } catch {
      toast.error("An unexpected error occurred while saving profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await updatePasswordAction({
        id: initialProfile.id,
        currentPassword: currentPassword || undefined,
        newPassword,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update password.");
        return;
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("An unexpected error occurred while changing password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const formattedDate = new Date(initialProfile.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Profile"
        description="Manage your personal accountant credentials, security preferences, and workspace identity."
      />

      {/* Top Profile Summary Card */}
      <Card className="border border-border bg-white shadow-card rounded-2xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-navy via-[#1F456E] to-teal relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-navy backdrop-blur-none shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
              Active Workspace User
            </span>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 border-2 border-white shadow-md flex-shrink-0">
                <div className="h-full w-full rounded-xl bg-navy text-white flex items-center justify-center text-2xl font-bold tracking-tight">
                  {initials}
                </div>
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-foreground leading-tight">{name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono bg-surface-subtle px-2 py-0.5 rounded border border-border">
                    @{initialProfile.loginId}
                  </span>
                  <span>•</span>
                  <span className="capitalize font-medium text-navy">
                    {initialProfile.role.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Company Settings
                </Button>
              </Link>
              <Link href="/settings/users">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  User Permissions
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 text-teal flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-semibold block tracking-wider">Email</span>
                <span className="font-medium text-foreground">{email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Shield className="h-4 w-4 text-teal flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold block tracking-wider">Assigned Role</span>
                <span className="font-semibold text-navy capitalize">{initialProfile.role.toLowerCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-teal flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold block tracking-wider">Joined Workspace</span>
                <span className="font-medium text-foreground">{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "general"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "security"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound className="h-4 w-4" /> Password & Security
        </button>
      </div>

      {/* Tab 1: General Details */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-border bg-white shadow-card rounded-xl">
              <CardHeader className="pb-4 border-b border-border bg-[#F9FAFB]/50">
                <CardTitle className="text-base font-semibold text-foreground">
                  Account Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Update your display name and primary notification email.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="pl-9 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Login ID
                      </label>
                      <Input
                        value={initialProfile.loginId}
                        disabled
                        className="text-xs font-mono bg-surface-subtle text-muted-foreground cursor-not-allowed"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        Login IDs cannot be modified.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="pl-9 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {profileLoading ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Role & Permissions Card */}
          <div>
            <Card className="border border-border bg-white shadow-card rounded-xl">
              <CardHeader className="pb-3 border-b border-border bg-[#F9FAFB]/50">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  Role Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5 text-xs">
                <div className="p-3 rounded-lg bg-primary-light/50 border border-border">
                  <p className="font-semibold text-navy capitalize">
                    {initialProfile.role.toLowerCase()} Privileges
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {initialProfile.role === "ADMINISTRATOR"
                      ? "Full system management, user provisioning, company settings, and accounting ledger controls."
                      : "General ledger entry, journal creation, invoicing, vendor bills, and financial statement generation."}
                  </p>
                </div>

                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Double-Entry Bookkeeping & Journals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Invoicing & Vendor Bill Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>P&L, Balance Sheet & Trial Balance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Furniture Inventory & Alert Monitoring</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-col gap-1.5">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-foreground text-xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      Executive Dashboard
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-foreground text-xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                      Financial Reports
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-border bg-white shadow-card rounded-xl">
              <CardHeader className="pb-4 border-b border-border bg-[#F9FAFB]/50">
                <CardTitle className="text-base font-semibold text-foreground">
                  Change Account Password
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ensure your account is using a strong password of at least 8 characters.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        New Password <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="pl-9 pr-9 text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Confirm New Password <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="pl-9 pr-9 text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <div>
            <Card className="border border-border bg-white shadow-card rounded-xl">
              <CardHeader className="pb-3 border-b border-border bg-[#F9FAFB]/50">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  • Use at least 8 characters with a blend of letters, numbers, and symbols.
                </p>
                <p>
                  • Never share your accountant workspace login credentials with unauthorized personnel.
                </p>
                <p>
                  • For portal customer/vendor logins, use the User & Portal Management section to send dedicated invitation links.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
