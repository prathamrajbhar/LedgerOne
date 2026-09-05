import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ label, error, helperText, required, className, id, ...props }, ref) => {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      </div>

      <textarea
        id={textareaId}
        ref={ref}
        rows={props.rows || 3}
        className={cn(
          "flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:border-navy disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
          error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive",
          className
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-destructive mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});
FormTextarea.displayName = "FormTextarea";
