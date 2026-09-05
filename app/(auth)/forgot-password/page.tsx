"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    toast.error(
      "Password reset is not yet available. Please contact your administrator for password assistance.",
      { duration: 5000 }
    );
  };

  return (
    <div className="bg-[#FAFBFE] shadow-[0_20px_50px_rgba(15,35,65,0.08)] border border-white/90 rounded-[24px] p-6 sm:p-7 space-y-4 backdrop-blur-sm">
      {/* Header with Title and Logo Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
            Reset Password 🔐
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter your registered email address and we&apos;ll send recovery instructions.
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

      {/* Feature notice */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-amber-900">
              Admin Password Assistance
            </h3>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Automated password reset requires security token configuration. Please contact your system administrator or IT team for password updates.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#193552] hover:bg-[#12283E] text-white font-medium h-11 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
        >
          Send Reset Link
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* OR Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#FAFBFE] px-3 text-muted-foreground font-semibold tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* Back to Sign In Link */}
      <div className="text-center text-xs text-muted-foreground pt-0.5">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#1F73B7] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3 inline" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
