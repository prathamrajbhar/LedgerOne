"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("portal-credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      if (result?.ok) {
        toast.success("Welcome to your portal!");
        router.push("/portal/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Portal login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-navy mb-2">Customer & Vendor Portal</h1>
          <p className="text-sm text-muted-foreground">
            Access your invoices, bills, and payment history
          </p>
        </div>

        <Card className="bg-white shadow-dropdown border border-border rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border bg-gradient-to-r from-teal-50 to-blue-50">
            <CardTitle className="text-xl font-bold text-foreground">
              Sign In to Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Password
                </label>
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal hover:bg-teal-hover text-white font-semibold py-2.5 shadow-sm text-xs gap-1.5"
              >
                {loading ? "Signing in..." : "Sign In to Portal"}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </Button>
            </form>

            <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
              Need help accessing your account? Contact your account manager.
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-xs text-muted-foreground">
          Are you an internal user?{" "}
          <a href="/login" className="font-semibold text-navy hover:underline">
            Sign in to workspace
          </a>
        </div>
      </div>
    </div>
  );
}
