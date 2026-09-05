"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("rohan.mehta");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      toast.error("Please enter both Login ID and password");
      return;
    }

    setLoading(true);

    try {
      // Simulate authentication
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Welcome back, Rohan!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Invalid Login ID or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-dropdown border border-border rounded-2xl overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border bg-[#F9FAFB]/50">
        <CardTitle className="text-xl font-bold text-foreground">
          Sign In to LedgerOne
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Access your company general ledger and business workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Login ID or Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. rohan.mehta"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-teal hover:text-teal-hover font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              defaultChecked
              className="h-4 w-4 rounded border-border text-navy focus:ring-navy cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
              Remember my workspace login
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-2.5 shadow-sm text-xs gap-1.5"
          >
            {loading ? "Signing in..." : "Sign In to Workspace"}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </form>

        <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
          Don&apos;t have an accountant account?{" "}
          <Link href="/sign-up" className="font-semibold text-navy hover:underline">
            Register Company
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
