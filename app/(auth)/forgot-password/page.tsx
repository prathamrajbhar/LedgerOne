"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // BLOCKED: Password reset functionality requires database schema changes
    toast.error(
      "Password reset is not yet available. Please contact your administrator for password assistance.",
      { duration: 5000 }
    );
  };

  return (
    <Card className="bg-white shadow-dropdown border border-border rounded-2xl overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border bg-[#F9FAFB]/50">
        <CardTitle className="text-xl font-bold text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Enter your registered email address and we&apos;ll send a recovery link.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Feature not available notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-900">
                Feature Not Available
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Password reset functionality requires database schema updates and is not yet available.
                Please contact your system administrator for password assistance.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="rohan@furniturecrafts.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs"
                required
                disabled
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled
            className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-2.5 shadow-sm text-xs gap-1.5 opacity-50 cursor-not-allowed"
          >
            Send Reset Link (Unavailable)
          </Button>

          <div className="pt-2 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
