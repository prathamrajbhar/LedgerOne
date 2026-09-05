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
  KeyRound,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CreditCard,
  History,
  Phone,
  MapPin,
  ArrowUpRight,
  Camera,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PortalProfileData,
  updatePortalProfileAction,
  updatePortalPasswordAction,
} from "./actions";

import { BannerSelectorModal } from "@/components/profile/banner-selector-modal";
import { Sparkles } from "lucide-react";

interface PortalProfileClientProps {
  initialProfile: PortalProfileData;
}

export function PortalProfileClient({ initialProfile }: PortalProfileClientProps) {
  // Profile form state
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [address, setAddress] = useState(initialProfile.address || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.profileImage || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialProfile.bannerUrl || null);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSelectBanner = async (newBannerUrl: string) => {
    setBannerSaving(true);
    try {
      const res = await fetch("/api/profile/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerUrl: newBannerUrl,
          targetType: "contact",
          targetId: initialProfile.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update banner");
      }

      setBannerUrl(newBannerUrl);
      toast.success("Profile banner updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update banner");
    } finally {
      setBannerSaving(false);
    }
  };

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
    : name.slice(0, 2).toUpperCase() || "CU";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetType", "contact");
    formData.append("targetId", initialProfile.id);

    setPhotoUploading(true);
    const toastId = toast.loading("Uploading profile photo to S3 storage...");

    try {
      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setAvatarUrl(data.url);
      toast.success("Profile photo uploaded to S3 successfully!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo to S3", {
        id: toastId,
      });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      const res = await updatePortalProfileAction({
        contactId: initialProfile.id,
        name,
        email,
        phone,
        address,
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
      const res = await updatePortalPasswordAction({
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
      <div>
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal partner credentials, security preferences, and portal identity.
        </p>
      </div>

      {/* Top Profile Summary Card (Matches Admin/Accountant theme exactly) */}
      <Card className="border border-border bg-white shadow-card rounded-2xl overflow-hidden">
        <div className="h-28 relative overflow-hidden bg-gradient-to-r from-navy via-[#1F456E] to-teal group">
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Profile Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Top Right Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors shadow-xs cursor-pointer"
              title="Change header banner"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal" />
              <span>Change Banner</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-navy shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
              Active Customer Partner
            </span>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              {/* Profile Photo Avatar with Upload Icon */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <div className="h-24 w-24 rounded-2xl bg-white p-1 border-2 border-white shadow-md flex-shrink-0 relative overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-navy text-white flex items-center justify-center text-2xl font-bold tracking-tight">
                      {initials}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute inset-1 rounded-xl bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    title="Change profile photo"
                  >
                    {photoUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mb-0.5" />
                        <span className="text-[9px] font-semibold">Upload</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Floating Add/Change Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-teal text-white shadow-md border-2 border-white flex items-center justify-center hover:bg-teal-hover transition-transform active:scale-95 cursor-pointer z-10"
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  {photoUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="mb-1">
                <h2 className="text-xl font-bold text-foreground leading-tight">{name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {initialProfile.user?.loginId ? (
                    <span className="font-mono bg-surface-subtle px-2 py-0.5 rounded border border-border">
                      @{initialProfile.user.loginId}
                    </span>
                  ) : (
                    <span className="font-mono bg-surface-subtle px-2 py-0.5 rounded border border-border">
                      Customer ID: {initialProfile.id.slice(0, 8)}
                    </span>
                  )}
                  <span>•</span>
                  <span className="capitalize font-medium text-navy">
                    {initialProfile.type.toLowerCase()} Partner
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/portal/billing">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
                  <CreditCard className="h-3.5 w-3.5 text-teal" />
                  My Billing
                </Button>
              </Link>
              <Link href="/portal/payments">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Payment History
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
                <span className="font-semibold text-navy capitalize">
                  {initialProfile.type.toLowerCase()} Partner
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-teal flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold block tracking-wider">Account Created</span>
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
                  Update your contact details, communication email, and delivery address.
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
                          placeholder="Your full or company name"
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
                        value={initialProfile.user?.loginId || "cust-portal"}
                        disabled
                        className="text-xs font-mono bg-surface-subtle text-muted-foreground cursor-not-allowed"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        Login IDs cannot be modified.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="pl-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Billing & Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street Address, City, State, Postal Code"
                        className="pl-9 text-xs"
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

          {/* Right Card: Portal Capabilities */}
          <div>
            <Card className="border border-border bg-white shadow-card rounded-xl">
              <CardHeader className="pb-3 border-b border-border bg-[#F9FAFB]/50">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  Portal Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5 text-xs">
                <div className="p-3 rounded-lg bg-primary-light/50 border border-border">
                  <p className="font-semibold text-navy capitalize">
                    {initialProfile.type.toLowerCase()} Privileges
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Authorized self-service portal access for checking live statements, viewing GST invoices, and clearing dues via Razorpay.
                  </p>
                </div>

                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Instant Razorpay Online Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Real-time Invoices & GST Receipts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>Account Ledger & Billing Statements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                    <span>24/7 Portal Self-Service</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-col gap-1.5">
                  <Link
                    href="/portal/billing"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-foreground text-xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      My Billing Statement
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/portal/payments"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-foreground text-xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      Payment History
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
                  Change Portal Password
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ensure your customer portal account is secured with a strong password of at least 8 characters.
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
                  • Keep your portal password confidential to protect your billing and payment data.
                </p>
                <p>
                  • Always log out after completing payment operations on shared devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Banner Selector Modal with 15 Top S3 Presets */}
      <BannerSelectorModal
        open={bannerModalOpen}
        onOpenChange={setBannerModalOpen}
        currentBannerUrl={bannerUrl}
        onSelectBanner={handleSelectBanner}
        loading={bannerSaving}
      />
    </div>
  );
}
