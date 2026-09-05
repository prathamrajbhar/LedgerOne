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
import { signOut } from "next-auth/react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

interface NavbarProps {
  onMenuClick?: () => void;
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

function getAccountingPeriods() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatDate = (d: Date) => `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;

  // Current Month
  const startCur = new Date(currentYear, currentMonth, 1);
  const endCur = new Date(currentYear, currentMonth + 1, 0);
  const currentMonthName = now.toLocaleDateString("en-US", { month: "long" });
  const currentMonthLabel = `${currentMonthName} ${currentYear} (Current)`;
  const currentMonthRange = `${formatDate(startCur)} - ${formatDate(endCur)}`;

  // Previous Month
  const startPrev = new Date(currentYear, currentMonth - 1, 1);
  const endPrev = new Date(currentYear, currentMonth, 0);
  const prevMonthName = startPrev.toLocaleDateString("en-US", { month: "long" });
  const prevMonthLabel = `${prevMonthName} ${startPrev.getFullYear()}`;
  const prevMonthRange = `${formatDate(startPrev)} - ${formatDate(endPrev)}`;

  // Fiscal Quarter & Year (Apr-Mar)
  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const fyEndYear = fyStartYear + 1;
  const fyLabel = `FY ${fyStartYear}-${String(fyEndYear).slice(-2)}`;

  let qNum = 1;
  let qStartMonth = 3;
  let qEndMonth = 5;
  if (currentMonth >= 6 && currentMonth <= 8) {
    qNum = 2;
    qStartMonth = 6;
    qEndMonth = 8;
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    qNum = 3;
    qStartMonth = 9;
    qEndMonth = 11;
  } else if (currentMonth <= 2) {
    qNum = 4;
    qStartMonth = 0;
    qEndMonth = 2;
  }
  const startQ = new Date(qNum === 4 ? fyEndYear : fyStartYear, qStartMonth, 1);
  const endQ = new Date(qNum === 4 ? fyEndYear : fyStartYear, qEndMonth + 1, 0);
  const quarterLabel = `Q${qNum} ${fyLabel}`;
  const quarterRange = `${formatDate(startQ)} - ${formatDate(endQ)}`;

  // Full Fiscal Year
  const startFY = new Date(fyStartYear, 3, 1);
  const endFY = new Date(fyEndYear, 3, 0);
  const fullFYLabel = `Full Fiscal Year ${fyLabel}`;
  const fullFYRange = `${formatDate(startFY)} - ${formatDate(endFY)}`;

  return [
    { label: currentMonthLabel, range: currentMonthRange },
    { label: prevMonthLabel, range: prevMonthRange },
    { label: quarterLabel, range: quarterRange },
    { label: fullFYLabel, range: fullFYRange },
  ];
}

export function Navbar({
  onMenuClick,
  userRole = UserRole.ADMINISTRATOR,
  userName,
  userEmail,
}: NavbarProps) {
  const periods = React.useMemo(() => getAccountingPeriods(), []);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState(periods[0].range);

  const displayName = userName || "User";
  const displayEmail = userEmail || "user@ledgerone.in";
  const roleDisplay = userRole === UserRole.ADMINISTRATOR ? "Administrator" : "Accountant";

  // Compute initials safely
  const initials = displayName.includes(" ")
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : displayName.slice(0, 2).toUpperCase() || "AD";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

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
            className="flex items-center w-full max-w-md h-9 px-3 rounded-lg border border-border bg-white text-xs text-muted-foreground hover:border-border-strong hover:bg-surface-subtle transition-all justify-between text-left"
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
              <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:bg-surface-subtle hover:border-border-strong transition-colors">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{selectedPeriod}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Accounting Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {periods.map((p) => (
                <DropdownMenuItem
                  key={p.label}
                  onClick={() => setSelectedPeriod(p.range)}
                  className={selectedPeriod === p.range ? "font-semibold text-navy bg-surface-subtle" : ""}
                >
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors text-left">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white text-xs font-semibold overflow-hidden border border-border">
                  <span>{initials}</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {roleDisplay}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile - visible to all */}
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              {/* ADMINISTRATOR-only menu items per docs/rbac.md */}
              {userRole === UserRole.ADMINISTRATOR && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings/users-management" className="flex items-center gap-2 cursor-pointer">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>User Management</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/company-profile" className="flex items-center gap-2 cursor-pointer">
                      <SettingsIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
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
