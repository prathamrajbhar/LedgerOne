import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  helperText,
  required,
  className,
  disabled,
}: FormSelectProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            error && "border-destructive focus:ring-destructive focus:border-destructive",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p className="text-xs text-destructive mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
