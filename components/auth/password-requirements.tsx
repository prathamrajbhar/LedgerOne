import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showMatch?: boolean;
}

export function PasswordRequirements({
  password,
  confirmPassword,
  showMatch = false,
}: PasswordRequirementsProps) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const rules = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "At least one uppercase letter (A-Z)", met: hasUppercase },
    { label: "At least one lowercase letter (a-z)", met: hasLowercase },
    { label: "At least one special character (!@#$...)", met: hasSpecial },
  ];

  if (showMatch) {
    rules.push({ label: "Passwords match", met: passwordsMatch });
  }

  return (
    <div className="space-y-1.5 rounded-lg bg-surface-subtle p-3 text-xs">
      <p className="font-semibold text-foreground">Password requirements:</p>
      <ul className="space-y-1">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 transition-colors ${
              rule.met ? "text-emerald-600 font-medium" : "text-muted-foreground"
            }`}
          >
            {rule.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
