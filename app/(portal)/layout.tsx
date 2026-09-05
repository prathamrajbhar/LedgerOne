"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { LogOut, FileText } from "lucide-react";
import { HelpAssistantWidget } from "@/components/help-assistant/chat-widget";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/invoices" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center font-bold text-white text-sm">
              L1
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">
              LedgerOne Portal
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/invoices"
              className="flex items-center gap-1.5 text-gray-700 hover:text-primary transition-colors"
            >
              <FileText className="h-4 w-4" />
              My Invoices
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-900">
              {session?.user?.name || "Customer Account"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {session?.user?.email || "customer@portal.local"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-600 hover:text-destructive gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <HelpAssistantWidget />
    </div>
  );
}
