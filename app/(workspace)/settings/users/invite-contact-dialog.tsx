"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function InviteContactDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string; user?: any }[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [email, setEmail] = useState("");
  const [generatedCreds, setGeneratedCreds] = useState<{ loginId: string; tempPass: string } | null>(null);

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await fetch("/api/contacts");
        if (res.ok) {
          const d = await res.json();
          if (d?.data) {
            setContacts(d.data);
          }
        }
      } catch {}
    }
    if (open) {
      loadContacts();
      setGeneratedCreds(null);
    }
  }, [open]);

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    const found = contacts.find((c) => c.id === id);
    if (found) {
      setEmail(found.email);
    }
  };

  const handleInvite = async () => {
    if (!selectedContactId || !email) {
      toast.error("Please choose a contact with an email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContactId, email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite contact");
      }

      const result = await res.json();
      toast.success("Portal access activated!");
      setGeneratedCreds({
        loginId: result.user.loginId,
        tempPass: result.tempPassword,
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invitation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Mail className="h-4 w-4" /> Invite Contact to Portal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Grant Contact Portal Access</DialogTitle>
        </DialogHeader>

        {generatedCreds ? (
          <div className="space-y-4 py-4 text-center">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900">Portal Credentials Generated</h4>
            <div className="p-4 bg-gray-50 border rounded-lg text-left text-sm space-y-1 font-mono">
              <p>Login ID: <span className="font-bold text-gray-900">{generatedCreds.loginId}</span></p>
              <p>Temp Password: <span className="font-bold text-primary">{generatedCreds.tempPass}</span></p>
            </div>
            <p className="text-xs text-muted-foreground">
              Share these credentials with the customer to allow them to view invoices and pay online.
            </p>
            <Button onClick={() => setOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contactSelect">Select Contact *</Label>
              <select
                id="contactSelect"
                value={selectedContactId}
                onChange={(e) => handleSelectContact(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Choose a contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Address</Label>
              <Input
                id="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {!generatedCreds && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={loading || !selectedContactId}>
              {loading ? "Generating..." : "Generate Portal Access"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
