"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface InviteResultCardProps {
  invitationResult: {
    loginId: string;
    temporaryPassword: string;
    emailSent?: boolean;
    emailError?: string | null;
    email?: string;
  };
  onDone: () => void;
}

export function InviteResultCard({
  invitationResult,
  onDone,
}: InviteResultCardProps) {
  const [copied, setCopied] = React.useState(false);

  const copyCreds = () => {
    navigator.clipboard.writeText(
      `Portal Login: ${invitationResult.loginId}\nPassword: ${invitationResult.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Credentials copied to clipboard");
  };

  return (
    <Card className="p-6 bg-white border border-border rounded-xl shadow-2xs space-y-4">
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs leading-relaxed space-y-1.5">
        <p className="font-bold flex items-center gap-1.5">
          <Check className="h-4 w-4 text-green-600" /> Portal Access Activated!
        </p>
        {invitationResult.emailSent ? (
          <p className="text-green-800">
            An invitation email with login instructions was successfully sent to{" "}
            <strong>{invitationResult.email || "the user"}</strong>.
          </p>
        ) : (
          <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
            Email delivery note: {invitationResult.emailError || "Could not connect to SMTP server"}. Please share credentials below directly.
          </p>
        )}
      </div>

      <div className="p-4 bg-muted rounded-lg font-mono text-xs space-y-2 border border-border">
        <div>
          <span className="text-muted-foreground">Login ID: </span>
          <span className="font-bold text-navy">{invitationResult.loginId}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Temporary Password: </span>
          <span className="font-bold text-navy">{invitationResult.temporaryPassword}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          size="sm"
          onClick={copyCreds}
          className="text-xs bg-navy text-white gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy Credentials"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDone}
          className="text-xs cursor-pointer"
        >
          Done
        </Button>
      </div>
    </Card>
  );
}
