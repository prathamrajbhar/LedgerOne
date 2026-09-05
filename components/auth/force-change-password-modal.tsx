"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";

import { useSession } from "next-auth/react";

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

  // Sync state if prop changes
  React.useEffect(() => {
    if (mustChangePassword) {
      setOpen(true);
    }
  }, [mustChangePassword]);

  if (!open) return null;

  // Password requirements checklist
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
      if (!passwordsMatch && confirmPassword) {
        setError("Passwords do not match");
      } else {
        setError("Please satisfy all password security requirements");
      }
      return;
    }

    setIsPending(true);

    try {
      const res = await changeTemporaryPasswordAction({
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.error || "Failed to change password");
        toast.error(res.error || "Failed to change password");
        setIsPending(false);
        return;
      }

      toast.success("Password updated successfully! Your account is now secured.");
      setOpen(false);

      // Update client session token immediately
      try {
        await update({ mustChangePassword: false });
      } catch {
        // Continue with router refresh even if update call fails
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
        hideCloseButton={true}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl sm:rounded-2xl"
      >
        <DialogHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <KeyRound className="h-6 w-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-gray-900">
            Set Your New Password
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-gray-500">
            You are currently signed in with a temporary password. For security, setting a new permanent password is required to access your account.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new permanent password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                className="pr-10"
                disabled={isPending}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter permanent password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className="pr-10"
                disabled={isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs space-y-1.5 text-gray-600">
            <div className="font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Password Requirements:
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className={hasMinLength ? "text-emerald-700" : ""}>8+ characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className={hasUppercase ? "text-emerald-700" : ""}>Uppercase (A-Z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className={hasLowercase ? "text-emerald-700" : ""}>Lowercase (a-z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSpecial ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className={hasSpecial ? "text-emerald-700" : ""}>Special (!@#$...)</span>
              </div>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200/60 mt-1">
                {passwordsMatch ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={passwordsMatch ? "text-emerald-700 font-medium" : "text-red-600"}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="w-full bg-[#193552] hover:bg-[#12283E] text-white flex items-center justify-center gap-2 h-10 font-medium text-xs rounded-xl transition-all"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Set Permanent Password & Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
