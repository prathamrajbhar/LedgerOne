"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Mail, Building, ArrowRight } from "lucide-react";
import { signUpAction } from "@/app/actions/auth.actions";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <Card className="bg-white shadow-dropdown border border-border rounded-2xl overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border bg-[#F9FAFB]/50">
        <CardTitle className="text-xl font-bold text-foreground">
          Create Accountant Account
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Set up LedgerOne for your furniture business or accounting practice.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rohan Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Furniture Business / Firm Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Royal Woodcrafts Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Login ID (6-12 chars) <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. rohan.mehta"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Official Email <span className="text-destructive">*</span>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Password (min 8 characters) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-2.5 shadow-sm text-xs gap-1.5 mt-2"
          >
            {loading ? "Creating Account..." : "Create Accountant Workspace"}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </form>

        <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-navy hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
