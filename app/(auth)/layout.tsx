import * as React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
            Ledger<span className="text-teal">One</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1 font-normal">
          Enterprise Accounting & Furniture ERP System
        </p>
      </div>

      {/* Main Form Card Shell */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2026 LedgerOne. All rights reserved.</p>
        <p className="text-[11px] text-muted-foreground/80 mt-1">
          Accurate records. A stronger tomorrow.
        </p>
      </div>
    </div>
  );
}
