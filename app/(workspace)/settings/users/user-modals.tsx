"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Mail, Copy, Check, Loader2 } from "lucide-react";
import { createInternalUserAction, inviteContactToPortalAction } from "@/app/actions/user-management.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";

interface UninvitedContact {
  id: string;
  name: string;
  email: string;
  type: string;
}

export function CreateUserModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [loginId, setLoginId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>(UserRole.ACCOUNTANT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createInternalUserAction({ name, loginId, email, password, role });
      if (res.success) {
        toast.success(`User ${name} created successfully!`);
        setOpen(false);
        setName("");
        setLoginId("");
        setEmail("");
        setPassword("");
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to create user");
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs bg-navy hover:bg-navy-dark text-white gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Create Staff Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-navy">Create Staff Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <FormInput label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
          <FormInput label="Login ID (6-12 chars)" required value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="e.g. john001" />
          <FormInput label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@ledgerone.com" />
          <FormInput label="Temporary Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, lowercase, symbol" />
          <FormSelect label="System Role" value={role} onValueChange={(val) => setRole(val as UserRole)} options={[{ value: UserRole.ACCOUNTANT, label: "Accountant" }, { value: UserRole.ADMINISTRATOR, label: "Administrator" }]} />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-navy text-white gap-1.5">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteContactModal({ contacts }: { contacts: UninvitedContact[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedContactId, setSelectedContactId] = React.useState(contacts[0]?.id || "");
  const [invitationResult, setInvitationResult] = React.useState<{
    loginId: string;
    temporaryPassword: string;
    emailSent?: boolean;
    emailError?: string | null;
    email?: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open && contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [open, contacts, selectedContactId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return toast.error("Please select a contact");
    setLoading(true);
    try {
      const selectedContact = contacts.find((c) => c.id === selectedContactId);
      const res = await inviteContactToPortalAction(selectedContactId);
      if (res.success && res.data) {
        toast.success("Contact portal credentials generated!");
        const inv = res.data as {
          loginId: string;
          temporaryPassword: string;
          emailSent?: boolean;
          emailError?: string | null;
        };
        setInvitationResult({
          ...inv,
          email: selectedContact?.email,
        });
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to generate portal invitation");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    if (!invitationResult) return;
    navigator.clipboard.writeText(`Portal Login: ${invitationResult.loginId}\nPassword: ${invitationResult.temporaryPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Credentials copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setInvitationResult(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs gap-1.5">
          <Mail className="h-3.5 w-3.5" /> Invite Client / Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-navy">Invite Client / Vendor</DialogTitle>
        </DialogHeader>
        {invitationResult ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-600" /> Portal Access Activated!
              </p>
              {invitationResult.emailSent ? (
                <p className="text-green-800">
                  An invitation email with login instructions was successfully sent to <strong>{invitationResult.email || "the user"}</strong>.
                </p>
              ) : (
                <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                  Email delivery note: {invitationResult.emailError || "Could not connect to SMTP server"}. Please share credentials below directly.
                </p>
              )}
            </div>
            <div className="p-3 bg-muted rounded-lg font-mono text-xs space-y-1 border border-border">
              <div><span className="text-muted-foreground">Login ID: </span><span className="font-bold text-navy">{invitationResult.loginId}</span></div>
              <div><span className="text-muted-foreground">Password: </span><span className="font-bold text-navy">{invitationResult.temporaryPassword}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" onClick={copyCreds} className="text-xs bg-navy text-white gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Credentials"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setOpen(false); setInvitationResult(null); }}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">Creates a portal login so customers can review invoices and suppliers can view purchase orders.</p>
            {contacts.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">All registered contacts already have portal credentials.</p>
            ) : (
              <FormSelect label="Select Contact" value={selectedContactId} onValueChange={(val) => setSelectedContactId(val)} options={contacts.map((c) => ({ value: c.id, label: `${c.name} (${c.type}) — ${c.email}` }))} />
            )}
            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={loading || contacts.length === 0} className="bg-navy text-white gap-1.5">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Generate Portal Access
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
