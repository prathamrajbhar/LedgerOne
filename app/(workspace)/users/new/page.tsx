"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { createInternalUserAction } from "@/app/actions/user-management.actions";
import { UserRole } from "@prisma/client";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [loginId, setLoginId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>(UserRole.ACCOUNTANT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await createInternalUserAction({
        name: name.trim(),
        loginId: loginId.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      if (res.success) {
        toast.success(`User ${name} created successfully!`);
        router.push("/users");
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to create user");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="space-y-3">
        <Link
          href="/users"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to User Management
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Create Staff Account
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Add a new internal system administrator or staff accountant.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/users")}
              disabled={loading}
              className="h-9 text-xs px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="h-9 text-xs px-4 bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save User
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-teal" /> Staff Account Details
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
          />

          <FormInput
            label="Login ID (6-12 chars)"
            required
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="e.g. john001"
          />

          <FormInput
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@ledgerone.com"
          />

          <FormInput
            label="Temporary Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars, uppercase, lowercase, symbol"
          />

          <FormSelect
            label="System Role"
            value={role}
            onValueChange={(val) => setRole(val as UserRole)}
            options={[
              { value: UserRole.ACCOUNTANT, label: "Accountant" },
              { value: UserRole.ADMINISTRATOR, label: "Administrator" },
            ]}
          />
        </form>
      </Card>
    </div>
  );
}
