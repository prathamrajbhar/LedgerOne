"use client";

import * as React from "react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { validateResetTokenAction, resetPasswordAction } from "@/app/actions/auth.actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setChecking(false);
        setTokenValid(false);
        setTokenError("No reset token provided. Please use the link sent to your email.");
        return;
      }

      const res = await validateResetTokenAction(token);
      setChecking(false);
      if (res.valid) {
        setTokenValid(true);
        if (res.email) setUserEmail(res.email);
      } else {
        setTokenValid(false);
        setTokenError(res.message || "This password reset link is invalid or has expired.");
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpper || !hasLower || !hasSpecial) {
      toast.error("Password must contain uppercase, lowercase, and special character.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordAction({
        token,
        password,
        confirmPassword,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update password");
        return;
      }

      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      toast.error("An error occurred while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFE] shadow-[0_20px_50px_rgba(15,35,65,0.08)] border border-white/90 rounded-[24px] p-6 sm:p-7 space-y-4 backdrop-blur-sm">
      {/* Header with Title and Logo */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {userEmail ? (
              <>Resetting password for <strong>{userEmail}</strong></>
            ) : (
              "Create a secure new password for your LedgerOne account."
            )}
          </p>
        </div>

        <div className="relative w-14 h-14 flex-shrink-0 rounded-2xl p-1 bg-white border border-border/60 shadow-2xs flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="LedgerOne Logo"
            width={56}
            height={56}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {checking ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#16324F]" />
          <p className="text-xs text-muted-foreground">Verifying security token...</p>
        </div>
      ) : !tokenValid ? (
        <div className="space-y-4 py-2">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-900">
                Invalid or Expired Link
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                {tokenError}
              </p>
            </div>
          </div>

          <Link
            href="/forgot-password"
            className="w-full bg-[#193552] hover:bg-[#12283E] text-white font-medium h-11 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F2942]">Password Changed Successfully</h3>
            <p className="text-xs text-muted-foreground">
              Redirecting you to the sign-in page...
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-[#1F73B7] font-semibold hover:underline"
          >
            Go to Sign In Now &rarr;
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Min. 8 characters with uppercase, lowercase, and special symbol.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      )}

      {/* Back to Sign In Link */}
      <div className="text-center text-xs text-muted-foreground pt-1 border-t border-border/70">
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAFBFE] rounded-[24px] p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#16324F]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
