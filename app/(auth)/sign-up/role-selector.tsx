"use client";

import * as React from "react";
import { UserRole } from "@prisma/client";
import { ShieldCheck, Calculator } from "lucide-react";

interface RoleSelectorProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ role, onChange, disabled }: RoleSelectorProps) {
  const isRoleAdmin = role === UserRole.ADMINISTRATOR;

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-foreground block">
        Account Role <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(UserRole.ADMINISTRATOR)}
          className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isRoleAdmin
              ? "bg-[#193552] text-white shadow-xs"
              : "bg-[#E1EAFD]/70 hover:bg-[#E1EAFD] text-[#0F2942] border border-black/5"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Administrator</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(UserRole.ACCOUNTANT)}
          className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            !isRoleAdmin
              ? "bg-[#193552] text-white shadow-xs"
              : "bg-[#E1EAFD]/70 hover:bg-[#E1EAFD] text-[#0F2942] border border-black/5"
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>Accountant</span>
        </button>
      </div>
    </div>
  );
}
