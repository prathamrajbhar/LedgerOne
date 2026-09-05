"use client";

import * as React from "react";
import {
  Menu,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearchDialog } from "@/components/ui/global-search";
import Link from "next/link";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState("01 Nov 2024 - 30 Nov 2024");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-[0_1px_2px_0_rgba(22,50,79,0.03)]">
        {/* Left Side: Mobile Menu Button & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-muted-foreground hover:bg-surface-subtle hover:text-foreground lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Global Search Input trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full max-w-md h-9 px-3 rounded-lg border border-border bg-surface text-xs text-muted-foreground hover:border-border-strong hover:bg-surface-subtle transition-all justify-between text-left"
          >
            <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">Search customers, invoices, products, transactions...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-surface-subtle px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                Ctrl
              </kbd>
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-surface-subtle px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Side: Date Selector, Notifications, User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Financial Period Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-subtle hover:border-border-strong transition-colors">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{selectedPeriod}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Accounting Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedPeriod("01 Nov 2024 - 30 Nov 2024")}>
                November 2024 (Current)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("01 Oct 2024 - 31 Oct 2024")}>
                October 2024
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("01 Jul 2024 - 30 Sep 2024")}>
                Q2 FY 2024-25
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("01 Apr 2024 - 31 Mar 2025")}>
                Full Fiscal Year FY 2024-25
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-xs">
              3
            </span>
          </Link>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors text-left">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white text-xs font-semibold overflow-hidden border border-border">
                  <span>RM</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    Rohan Mehta
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Administrator
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Rohan Mehta</p>
                  <p className="text-[11px] text-muted-foreground">rohan.mehta@ledgerone.in</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <SettingsIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Company Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/accounts" className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Accounting Permissions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
