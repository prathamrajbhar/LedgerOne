"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Menu, LogOut, User, ShieldCheck, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ContactType } from "@prisma/client";

interface PortalHeaderProps {
  contactName: string;
  contactType: ContactType;
  contactAvatar?: string | null;
  onMenuClick?: () => void;
}

export default function PortalHeader({
  contactName,
  contactType,
  contactAvatar,
  onMenuClick,
}: PortalHeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const displayName = contactName || "Partner";
  const initials = displayName.includes(" ")
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : displayName.slice(0, 2).toUpperCase() || "PT";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-[0_1px_2px_0_rgba(22,50,79,0.03)]">
      {/* Left: Mobile Menu Toggle & Portal Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:bg-surface-subtle hover:text-foreground lg:hidden"
          aria-label="Toggle Portal Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-navy hidden sm:inline-block">
            LedgerOne Client Portal
          </span>
          <span className="hidden sm:inline-block text-muted-foreground/50">|</span>
          <span className="text-xs text-muted-foreground capitalize">
            {contactType.toLowerCase()} Workspace
          </span>
        </div>
      </div>

      {/* Right: User Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors text-left">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white text-xs font-semibold overflow-hidden border border-border">
                {contactAvatar ? (
                  <img
                    src={contactAvatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal capitalize">
                  {contactType.toLowerCase()} Account
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {contactType.toLowerCase()} Portal Access
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/portal/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/portal/dashboard" className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Overview</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
