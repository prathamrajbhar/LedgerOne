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
        // Hard navigation guarantees fresh cookies in request headers across middleware on production
        window.location.href = targetUrl || "/dashboard";
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] min-h-[460px] sm:min-h-[490px] bg-white/95 backdrop-blur-md shadow-[0_20px_60px_rgba(15,35,65,0.08)] border border-white/80 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
      {/* Header with Title & Subtitle */}
      <div className="flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight leading-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-[#526477] leading-relaxed mt-1">
          Sign in to your LedgerOne workspace and continue managing your business with ease.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 pt-1.5 flex-1 flex flex-col justify-center min-h-0">
        {/* LOGIN ID FIELD */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F2942] block">
            Login ID or Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8B9E] pointer-events-none" />
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="e.g. admin001, cust006, or email"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl bg-[#EEF4FC] hover:bg-[#E8F0FA] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#167C80]/30 text-xs sm:text-sm text-[#0F2942] placeholder:text-[#8C9BAE] transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* PASSWORD FIELD */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#0F2942] block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#1F73B7] hover:underline font-medium py-0.5"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8B9E] pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-xl bg-[#EEF4FC] hover:bg-[#E8F0FA] focus:bg-white border-0 ring-1 ring-black/5 focus:ring-2 focus:ring-[#167C80]/30 text-xs sm:text-sm text-[#0F2942] placeholder:text-[#8C9BAE] transition-all outline-none font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A8B9E] hover:text-[#0F2942] transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* REMEMBER ME */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#0F2942] accent-[#0F2942] cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-xs text-[#526477] cursor-pointer select-none"
          >
            Remember my workspace login
          </label>
        </div>

        {/* SIGN-IN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 sm:h-[46px] bg-[#0F2942] hover:bg-[#163859] text-white font-bold rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all mt-1.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] flex-shrink-0"
        >
          <span>{loading ? "Signing in..." : "Sign In"}</span>
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      {/* DIVIDER */}
      <div className="relative my-2 flex-shrink-0">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/95 px-3 text-[#8C9BAE] font-semibold tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* REGISTRATION */}
      <div className="text-center text-xs text-[#526477] pt-0.5 flex-shrink-0">
        Don&apos;t have an accountant account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#1F73B7] hover:underline ml-1"
        >
          Register Company
        </Link>
      </div>
    </div>
  );
}
