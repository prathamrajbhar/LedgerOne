"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeTemporaryPasswordAction } from "@/app/actions/auth.actions";
import { PasswordRequirements } from "./password-requirements";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

interface ForceChangePasswordModalProps {
  mustChangePassword?: boolean;
}

export function ForceChangePasswordModal({
  mustChangePassword = false,
}: ForceChangePasswordModalProps) {
  const router = useRouter();
  const { update } = useSession();
  const [open, setOpen] = useState(mustChangePassword);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mustChangePassword) {
      setOpen(true);
    }
  }, [mustChangePassword]);

  if (!open) return null;

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError(passwordsMatch ? "Please satisfy all password security requirements" : "Passwords do not match");
      return;
    }

    setIsPending(true);

    try {
      const res = await changeTemporaryPasswordAction({ newPassword, confirmPassword });
      if (!res.success) {
        setError(res.error || "Failed to change password");
        toast.error(res.error || "Failed to change password");
        setIsPending(false);
        return;
      }

      toast.success("Password updated successfully! Your account is now secured.");
      setOpen(false);

      try {
        await update({ mustChangePassword: false });
      } catch {
        // Continue even if session update throws
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[440px] [&>button]:hidden bg-card text-card-foreground shadow-2xl border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Set Your Permanent Password
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            You are logging in with a temporary password. Please establish a strong permanent password to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-semibold">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pr-10 text-sm"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-semibold">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pr-10 text-sm"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <PasswordRequirements password={newPassword} confirmPassword={confirmPassword} showMatch />

          <Button type="submit" disabled={!isValid || isPending} className="w-full font-semibold">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Save & Continue to Workspace
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
