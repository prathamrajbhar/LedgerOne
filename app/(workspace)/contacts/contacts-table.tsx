"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface ContactItem {
  id: string;
  name: string;
  type: "CUSTOMER" | "VENDOR" | "BOTH";
  email: string;
  phone?: string | null;
  address?: string | null;
  outstandingBalance?: number;
  totalTransactions?: number;
  isArchived?: boolean;
}

interface ContactsTableProps {
  contacts: ContactItem[];
  onInvitePortal?: (contact: ContactItem) => void;
}

export function ContactsTable({ contacts, onInvitePortal }: ContactsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Address</th>
              <th className="py-3.5 px-4 text-right">Outstanding</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  No contacts found.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-primary-light/30 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-light text-navy font-bold text-xs border border-navy/10 flex-shrink-0">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-semibold text-foreground hover:text-navy hover:underline block"
                        >
                          {contact.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        contact.type === "CUSTOMER"
                          ? "default"
                          : contact.type === "VENDOR"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {contact.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {contact.phone || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                    {contact.address || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{contact.outstandingBalance?.toLocaleString("en-IN") || "0.00"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}/edit`}>Edit Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onInvitePortal) {
                              onInvitePortal(contact);
                            } else {
                              toast.success(`Portal invite sent to ${contact.email}`);
                            }
                          }}
                        >
                          Invite to Portal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
