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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { toast } from "sonner";
import {
  getJournalsAction,
  createJournalAction,
  getSelectableAccountsAction,
} from "@/app/actions/master-data.actions";
import { JournalType } from "@prisma/client";

interface JournalItem {
  id: string;
  code: string;
  name: string;
  type: "SALES" | "PURCHASE" | "BANK" | "CASH";
  defaultAccount: {
    id: string;
    code: string;
    name: string;
  };
}

interface AccountOption {
  id: string;
  code: string;
  name: string;
}

export default function JournalsPage() {
  const [journals, setJournals] = React.useState<JournalItem[]>([]);
  const [accounts, setAccounts] = React.useState<AccountOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<JournalType>("SALES");
  const [defaultAccountId, setDefaultAccountId] = React.useState("");

  // Fetch journals and accounts on mount
  React.useEffect(() => {
    loadJournals();
    loadAccounts();
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const result = await getJournalsAction();
      if (result.success && result.data) {
        setJournals(result.data as JournalItem[]);
      } else {
        toast.error(result.error || "Failed to load journals");
      }
    } catch {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const result = await getSelectableAccountsAction();
      if (result.success && result.data) {
        setAccounts(result.data as AccountOption[]);
      }
    } catch {
      // Ignored
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !name) {
      toast.error("Code and Name are required");
      return;
    }

    if (!defaultAccountId) {
      toast.error("Default account is required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createJournalAction({
        code: code.toUpperCase(),
        name,
        type,
        defaultAccountId,
      });

      if (result.success) {
        toast.success(`Journal "${name}" configured.`);
        setOpenModal(false);
        setCode("");
        setName("");
        setType("SALES");
        setDefaultAccountId("");
        loadJournals(); // Reload journals
      } else {
        toast.error(result.error || "Failed to create journal");
      }
    } catch (error) {
      toast.error("Failed to create journal");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = journals.filter(
    (j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase())
  );

  const accountOptions = React.useMemo(() => {
    return accounts.map((acc) => ({
      value: acc.id,
      label: `${acc.code} - ${acc.name}`,
      subLabel: `Account #${acc.code}`,
    }));
  }, [accounts]);

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
                  label="Journal Code"
                  required
                  placeholder="e.g. INV"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <FormInput
                  label="Journal Name"
                  required
                  placeholder="e.g. Customer Invoices"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormSelect
                  label="Journal Type"
                  value={type}
                  onValueChange={(val) => setType(val as JournalType)}
                  options={[
                    { value: "SALES", label: "Sales (Customer Invoices)" },
                    { value: "PURCHASE", label: "Purchase (Vendor Bills)" },
                    { value: "BANK", label: "Bank Account" },
                    { value: "CASH", label: "Cash Book" },
                  ]}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Default Offset Account <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    value={defaultAccountId}
                    onChange={setDefaultAccountId}
                    options={accountOptions}
                    placeholder="Select an account"
                    searchPlaceholder="Search account by code or name..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-navy hover:bg-navy-hover text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Journal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <div className="max-w-sm w-full">
          <DebouncedSearchInput
            placeholder="Search journals by name or code..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading journals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {search
              ? "No journals found matching your search"
              : "No journals yet. Create your first journal to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
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
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {j.defaultAccount.code} - {j.defaultAccount.name}
                  </td>
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
      )}
    </div>
  );
}
