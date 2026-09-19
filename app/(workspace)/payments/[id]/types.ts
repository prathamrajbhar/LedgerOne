export interface SerializedPaymentJournalLine {
  id: string;
  account: {
    code: string;
    name: string;
  };
  partnerName?: string | null;
  debit: number;
  credit: number;
}

export interface SerializedPaymentJournalEntry {
  id: string;
  entryNumber: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
  lines: SerializedPaymentJournalLine[];
}

export interface SerializedPaymentRecord {
  id: string;
  ref: string;
  direction: "INBOUND" | "OUTBOUND";
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  source: string;
  note?: string | null;
  accountName: string;
  party: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
  };
  settledDocument: {
    type: "INVOICE" | "BILL";
    id: string;
    number: string;
    date: string;
    total: number;
    amountPaid: number;
    amountDue: number;
    status: string;
  };
  journalEntry?: SerializedPaymentJournalEntry | null;
}
