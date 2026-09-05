"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordResetAction(email);
      if (!result.success) {
        toast.error(result.error || "Failed to send reset link");
        return;
      }

      setSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFE] shadow-[0_20px_50px_rgba(15,35,65,0.08)] border border-white/90 rounded-[24px] p-6 sm:p-7 space-y-4 backdrop-blur-sm">
      {/* Header with Title and Logo Badge */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          Enter your registered email address and we&apos;ll send recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4 py-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-emerald-900">
                Check Your Inbox
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                If an active account exists for <strong>{email}</strong>, we have sent password reset instructions with a secure recovery link.
              </p>
              <p className="text-[11px] text-emerald-700 pt-1">
                The link will expire in 60 minutes for security reasons.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="w-full text-xs text-[#1F73B7] hover:underline font-medium text-center py-1 cursor-pointer"
          >
            Didn&apos;t receive it? Try another email
          </button>
        </div>
      ) : (
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
                disabled={loading}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none disabled:opacity-60"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#193552] hover:bg-[#12283E] active:scale-[0.99] text-white font-medium h-11 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Recovery Link...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      )}

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
