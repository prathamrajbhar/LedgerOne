"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type:
    | "ASSET"
    | "LIABILITY"
    | "BANK"
    | "CAPITAL"
    | "CASH"
    | "INCOME"
    | "EXPENSES"
    | "OTHER_EXPENSES";
  isArchived: boolean;
}

interface AccountsTableProps {
  accounts: AccountItem[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const getTypeBadge = (type: AccountItem["type"]) => {
    switch (type) {
      case "ASSET":
      case "BANK":
      case "CASH":
        return <Badge variant="default">{type}</Badge>;
      case "INCOME":
        return <Badge variant="success">{type}</Badge>;
      case "EXPENSES":
      case "OTHER_EXPENSES":
        return <Badge variant="warning">{type}</Badge>;
      case "LIABILITY":
      case "CAPITAL":
        return <Badge variant="secondary">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Account Name</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {accounts.map((acc) => (
              <tr
                key={acc.id}
                className="hover:bg-primary-light/30 transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-navy">
                  {acc.code}
                </td>
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  {acc.name}
                </td>
                <td className="py-3.5 px-4">{getTypeBadge(acc.type)}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={acc.isArchived ? "muted" : "outline"} className="text-[10px]">
                    {acc.isArchived ? "Archived" : "Active"}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info(`Viewing ledger for ${acc.name}`)}>
                        View General Ledger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Account ${acc.code} details copied.`)}>
                        Copy Account Code
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
