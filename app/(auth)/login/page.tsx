"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { getPostLoginRedirectAction } from "@/app/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      toast.error("Please enter both Login ID or Email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        loginId: loginId.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid Login ID / Email or Password");
        return;
      }

      if (result?.ok) {
        toast.success("Welcome back!");
        // Determine correct landing page based on role (Portal vs Workspace)
        const targetUrl = await getPostLoginRedirectAction(loginId);
        router.push(targetUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFE] shadow-[0_20px_50px_rgba(15,35,65,0.08)] border border-white/90 rounded-[24px] p-6 sm:p-7 space-y-4 backdrop-blur-sm">
      {/* Header with Title and New Brand Logo */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sign in to your LedgerOne workspace and continue managing your business with ease.
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Login ID or Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            Login ID or Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. cust006, admin001, or email"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#1F73B7] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#E1EAFD]/90 hover:bg-[#E1EAFD] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#193552]/20 text-xs text-foreground placeholder:text-muted-foreground transition-all outline-none font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-[#193552] accent-[#193552] cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-xs text-muted-foreground cursor-pointer select-none"
          >
            Remember my workspace login
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#193552] hover:bg-[#12283E] text-white font-medium h-11 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
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

      {/* Register Footer Link */}
      <div className="text-center text-xs text-muted-foreground pt-0.5">
        Don&apos;t have an accountant account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#1F73B7] hover:underline"
        >
          Register Company
        </Link>
      </div>
    </div>
  );
}
