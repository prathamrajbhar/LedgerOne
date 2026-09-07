import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  getJournalsAction,
  getSelectableAccountsAction,
} from "@/app/actions/master-data.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import type {
  JournalOption,
  AccountOption,
  ContactOption,
} from "../journal-entries-types";
import { JournalEntryCreateClient } from "./journal-entry-create-client";

async function NewJournalEntryContent() {
  const [journalsRes, accountsRes, contactsRes] = await Promise.all([
    getJournalsAction(),
    getSelectableAccountsAction(),
    getContactsAction({ limit: 1000 }),
  ]);

  const journals =
    journalsRes.success && journalsRes.data
      ? (journalsRes.data as unknown as JournalOption[])
      : [];
  const accounts =
    accountsRes.success && accountsRes.data
      ? (accountsRes.data as unknown as AccountOption[])
      : [];
  const contactsData = contactsRes.success && contactsRes.data
    ? (contactsRes.data as { contacts: ContactOption[] })
    : { contacts: [] };
  const contacts = contactsData.contacts || [];

  return (
    <JournalEntryCreateClient
      journals={journals}
      accounts={accounts}
      contacts={contacts}
    />
  );
}

export default function NewJournalEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Journal Entry Form...
          </p>
        </div>
      }
    >
      <NewJournalEntryContent />
    </Suspense>
  );
}
