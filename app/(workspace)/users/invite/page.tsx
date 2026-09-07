"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import {
  getUninvitedContactsAction,
  inviteContactToPortalAction,
} from "@/app/actions/user-management.actions";
import { InviteResultCard } from "./components/invite-result-card";

interface UninvitedContact {
  id: string;
  name: string;
  email: string;
  type: string;
}

export default function InviteContactPage() {
  const router = useRouter();
  const [contacts, setContacts] = React.useState<UninvitedContact[]>([]);
  const [loadingContacts, setLoadingContacts] = React.useState(true);
  const [selectedContactId, setSelectedContactId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [invitationResult, setInvitationResult] = React.useState<{
    loginId: string;
    temporaryPassword: string;
    emailSent?: boolean;
    emailError?: string | null;
    email?: string;
  } | null>(null);

  React.useEffect(() => {
    async function loadContacts() {
      try {
        const res = await getUninvitedContactsAction();
        if (res.success && res.data) {
          const list = res.data as UninvitedContact[];
          setContacts(list);
          if (list.length > 0) {
            setSelectedContactId(list[0].id);
          }
        }
      } catch {
        toast.error("Failed to load eligible contacts");
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) {
      toast.error("Please select a contact to invite");
      return;
    }

    setSubmitting(true);
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
        return;
      }
      toast.error(res.error || "Failed to generate portal invitation");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="space-y-3">
        <Link
          href="/users"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to User Management
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Invite Client / Vendor to Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Issue portal access credentials to an existing customer or vendor contact.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
            className="h-9 text-xs px-4 cursor-pointer"
          >
            Back to Users
          </Button>
        </div>
      </div>

      {invitationResult ? (
        <InviteResultCard
          invitationResult={invitationResult}
          onDone={() => {
            setInvitationResult(null);
            router.push("/users");
          }}
        />
      ) : (
        <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
          <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-teal" /> Select Uninvited Contact
          </div>

          {loadingContacts ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading eligible contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              All contacts have already been invited to the portal.
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <FormSelect
                label="Contact Person"
                value={selectedContactId}
                onValueChange={setSelectedContactId}
                options={contacts.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.email || "No Email"}) - ${c.type}`,
                }))}
              />

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-teal hover:bg-teal/90 text-white gap-1.5 cursor-pointer shadow-2xs"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Issue Portal Access
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
