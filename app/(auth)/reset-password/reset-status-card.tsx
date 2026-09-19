import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TokenErrorCardProps {
  error: string;
}

export function TokenErrorCard({ error }: TokenErrorCardProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-rose-900">Invalid or Expired Link</h3>
          <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
        </div>
      </div>
      <Link
        href="/forgot-password"
        className="w-full bg-[#193552] hover:bg-[#12283E] text-white font-medium h-11 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        Request New Reset Link
      </Link>
    </div>
  );
}

export function ResetSuccessCard() {
  return (
    <div className="space-y-4 py-4 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-[#0F2942]">Password Changed Successfully</h3>
        <p className="text-xs text-muted-foreground">Redirecting you to the sign-in page...</p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-xs text-[#1F73B7] font-semibold hover:underline"
      >
        Go to Sign In Now &rarr;
      </Link>
    </div>
  );
}
