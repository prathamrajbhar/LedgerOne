"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContactItem } from "./contacts-table";

interface ContactsKanbanProps {
  contacts: ContactItem[];
}

export function ContactsKanban({ contacts }: ContactsKanbanProps) {
  if (contacts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground bg-white rounded-xl border border-border">
        No contacts found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {contacts.map((contact) => (
        <Card
          key={contact.id}
          className="p-4 hover:border-navy hover:shadow-dropdown transition-all bg-white flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-light text-navy font-bold text-xs border border-navy/10 flex-shrink-0">
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="font-semibold text-sm text-foreground hover:text-navy hover:underline line-clamp-1"
                  >
                    {contact.name}
                  </Link>
                  <Badge
                    variant={
                      contact.type === "CUSTOMER"
                        ? "default"
                        : contact.type === "VENDOR"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[9px] mt-1"
                  >
                    {contact.type}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t border-border/70 pt-3">
              <div className="flex items-center gap-2 truncate">
                <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                Outstanding Balance
              </span>
              <span className="font-bold text-foreground">
                ₹{contact.outstandingBalance?.toLocaleString("en-IN") || "0.00"}
              </span>
            </div>
            <Link
              href={`/contacts/${contact.id}`}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-navy hover:bg-primary-light transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
