import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";

export interface JournalEntryItem {
  id: string;
  entryNumber: string;
  accountingDate: Date;
  status: JournalEntryStatus;
  source: JournalEntrySource;
  totalDebit: number;
  totalCredit: number;
  journal: {
    id: string;
    code: string;
    name: string;
  };
  lines: Array<{
    id: string;
    account: {
      code: string;
      name: string;
    };
    partner?: {
      name: string;
    } | null;
    debit: number;
    credit: number;
  }>;
  createdBy: {
    name: string;
  };
}

export interface JournalOption {
  id: string;
  code: string;
  name: string;
}

export interface AccountOption {
  id: string;
  code: string;
  name: string;
}

export interface ContactOption {
  id: string;
  name: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  partnerId: string;
  description: string;
  debit: string;
  credit: string;
}
