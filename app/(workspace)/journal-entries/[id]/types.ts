export interface SerializedJeLine {
  id: string;
  account: {
    code: string;
    name: string;
    type?: string;
  };
  partner?: {
    name: string;
  } | null;
  debit: number;
  credit: number;
}

export interface SerializedJournalEntryDetail {
  id: string;
  entryNumber: string;
  accountingDate: string;
  status: string;
  source: string;
  reference: string | null;
  totalDebit: number;
  totalCredit: number;
  journal: {
    code: string;
    name: string;
    type: string;
  };
  createdBy?: {
    name: string | null;
    email: string;
  } | null;
  vendorBill?: {
    id: string;
    billNumber: string;
    vendor?: { name: string } | null;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    customer?: { name: string } | null;
  } | null;
  billPayment?: {
    id: string;
    amount: number;
    vendorBill?: { id: string; billNumber: string } | null;
  } | null;
  invoicePayment?: {
    id: string;
    amount: number;
    invoice?: { id: string; invoiceNumber: string } | null;
  } | null;
  lines: SerializedJeLine[];
}
