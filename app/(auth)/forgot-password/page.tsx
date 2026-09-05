"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Password reset instructions sent to your email.");
    }, 400);
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
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal mx-auto">
              <Send className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We&apos;ve dispatched password recovery instructions to <strong>{email}</strong>.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="secondary" size="sm" className="text-xs gap-1.5 w-full">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
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
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-2.5 shadow-sm text-xs gap-1.5"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>

            <div className="pt-2 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
