"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, User, Mail, Building, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signUpAction } from "@/app/actions/auth.actions";
import { UserRole } from "@prisma/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !loginId || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpAction({
        name,
        loginId,
        email,
        password,
        companyName: companyName || undefined,
        role: UserRole.ACCOUNTANT,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to create account");
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFE] shadow-[0_20px_50px_rgba(15,35,65,0.08)] border border-white/90 rounded-[24px] p-5 sm:p-6 space-y-3.5 backdrop-blur-sm">
      {/* Header with Title and Logo Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Set up your LedgerOne workspace and manage your furniture business.
          </p>
        </div>

        {/* LedgerOne Brand Logo Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-full p-0.5 bg-white border border-border/60 shadow-xs flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="LedgerOne Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5 pt-0.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground block">
            Full Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* Furniture Business / Firm Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground block">
            Furniture Business / Firm Name
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Elegant Living Furniture"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
            />
          </div>
        </div>

        {/* Login ID */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground block">
            Login ID (6-12 chars) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. user_lead01"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs font-mono text-foreground placeholder:text-muted-foreground transition-all outline-none"
            required
          />
        </div>

        {/* Official Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground block">
            Official Email <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground block">
            Password (min 8 characters) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-9 pl-9 pr-9 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#193552] hover:bg-[#12283E] text-white font-medium h-10 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Creating Workspace..." : "Create Account"}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>

      {/* OR Divider */}
      <div className="relative my-2.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#FAFBFE] px-3 text-muted-foreground font-semibold tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* Sign In Footer Link */}
      <div className="text-center text-xs text-muted-foreground pt-0.5">
        Already have a workspace account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#1F73B7] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
