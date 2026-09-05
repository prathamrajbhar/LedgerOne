"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";

interface JournalItem {
  id: string;
  name: string;
  code: string;
  type: "SALES" | "PURCHASE" | "BANK" | "CASH" | "GENERAL";
  defaultAccount: string;
}

const initialJournals: JournalItem[] = [
  { id: "j-1", name: "Customer Invoices Journal", code: "INV", type: "SALES", defaultAccount: "4000 Furniture Sales Revenue" },
  { id: "j-2", name: "Vendor Bills & Timber Purchases", code: "BILL", type: "PURCHASE", defaultAccount: "5010 Raw Material Wood Purchases" },
  { id: "j-3", name: "HDFC Bank Operations Journal", code: "BNK1", type: "BANK", defaultAccount: "1010 HDFC Bank Current A/c" },
  { id: "j-4", name: "Showroom Cash Register Journal", code: "CSH1", type: "CASH", defaultAccount: "1020 Cash in Hand" },
  { id: "j-5", name: "Miscellaneous & Year-End Adjustments", code: "MISC", type: "GENERAL", defaultAccount: "3000 Owner's Capital" },
];

export default function JournalsPage() {
  const [journals, setJournals] = React.useState(initialJournals);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<JournalItem["type"]>("GENERAL");
  const [defaultAccount, setDefaultAccount] = React.useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Name and Code are required");
      return;
    }

    const created: JournalItem = {
      id: `j-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      type,
      defaultAccount: defaultAccount || "General Ledger",
    };

    setJournals([...journals, created]);
    toast.success(`Journal "${name}" configured.`);
    setOpenModal(false);
    setName("");
    setCode("");
  };

  const filtered = journals.filter(
    (j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounting Journals"
        description="Configure accounting posting books for sales, timber purchases, liquid bank flows, and general entries."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                New Journal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Journal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <FormInput
                  label="Journal Name"
                  required
                  placeholder="e.g. Workshop Petty Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormInput
                  label="Short Prefix Code"
                  required
                  placeholder="e.g. WPC"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <FormSelect
                  label="Journal Type"
                  value={type}
                  onValueChange={(val) => setType(val as JournalItem["type"])}
                  options={[
                    { value: "SALES", label: "Sales (Customer Invoices)" },
                    { value: "PURCHASE", label: "Purchase (Vendor Bills)" },
                    { value: "BANK", label: "Bank Account" },
                    { value: "CASH", label: "Cash Book" },
                    { value: "GENERAL", label: "General Operations / Journal Entries" },
                  ]}
                />
                <FormInput
                  label="Default Offset Account"
                  placeholder="e.g. 1020 Cash in Hand"
                  value={defaultAccount}
                  onChange={(e) => setDefaultAccount(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-navy hover:bg-navy-hover text-white">
                    Save Journal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search journals by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Prefix</th>
              <th className="py-3.5 px-4">Journal Name</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Default Account</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-primary-light/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-navy">{j.code}</td>
                <td className="py-3.5 px-4 font-semibold text-foreground">{j.name}</td>
                <td className="py-3.5 px-4">
                  <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                    {j.type}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">{j.defaultAccount}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
