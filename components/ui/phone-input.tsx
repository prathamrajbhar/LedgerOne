"use client";

import * as React from "react";
import {
  Country,
  ALL_COUNTRIES,
  DEFAULT_COUNTRY,
  POPULAR_COUNTRY_CODES,
} from "@/lib/constants/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  defaultCountryCode?: string;
}

/**
 * Parses an incoming phone number string into a matching Country and national number.
 */
function parsePhone(
  value: string | undefined,
  countries: Country[],
  fallback: Country
): { country: Country; nationalNumber: string } {
  if (!value || !value.trim()) {
    return { country: fallback, nationalNumber: "" };
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("+")) {
    // Sort descending by dialCode length to match longer codes first (e.g., +1242 before +1)
    const sorted = [...countries].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );
    for (const c of sorted) {
      if (trimmed.startsWith(c.dialCode)) {
        const rest = trimmed.slice(c.dialCode.length).trim();
        return { country: c, nationalNumber: rest };
      }
    }
  }

  // If no prefix detected, default country with given number
  return { country: fallback, nationalNumber: trimmed };
}

/**
 * Flag display with high-res CDN image and fallback to native unicode emoji.
 */
export function CountryFlag({
  code,
  name,
  flag,
  className,
}: {
  code: string;
  name: string;
  flag: string;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <span
        className={cn("text-base leading-none select-none shrink-0", className)}
        role="img"
        aria-label={name}
      >
        {flag}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 w-5 h-3.5 overflow-hidden rounded-[2px] shadow-xs border border-border/60 bg-muted/20",
        className
      )}
    >
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </span>
  );
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      value = "",
      onChange,
      placeholder,
      required,
      disabled,
      error,
      helperText,
      className,
      id,
      defaultCountryCode = "IN",
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const internalInputRef = React.useRef<HTMLInputElement | null>(null);

    // Initial country lookup
    const initialDefault = React.useMemo(() => {
      return (
        ALL_COUNTRIES.find(
          (c) => c.code.toUpperCase() === defaultCountryCode.toUpperCase()
        ) || DEFAULT_COUNTRY
      );
    }, [defaultCountryCode]);

    // Parse initial value
    const parsedInitial = React.useMemo(
      () => parsePhone(value, ALL_COUNTRIES, initialDefault),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      parsedInitial.country
    );
    const [nationalNumber, setNationalNumber] = React.useState<string>(
      parsedInitial.nationalNumber
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Sync state when external value changes externally (e.g. form reset or pre-population)
    React.useEffect(() => {
      if (value !== undefined) {
        const parsed = parsePhone(value, ALL_COUNTRIES, selectedCountry);
        // Only update if nationalNumber or dial code changed externally
        const currentCombined = nationalNumber
          ? `${selectedCountry.dialCode} ${nationalNumber}`.trim()
          : "";
        const incomingTrimmed = value.trim();

        if (incomingTrimmed !== currentCombined && incomingTrimmed !== nationalNumber) {
          setSelectedCountry(parsed.country);
          setNationalNumber(parsed.nationalNumber);
        }
      }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    // Popular countries
    const popularCountries = React.useMemo(() => {
      return ALL_COUNTRIES.filter((c) => POPULAR_COUNTRY_CODES.includes(c.code));
    }, []);

    // Filtered countries based on search
    const filteredCountries = React.useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return ALL_COUNTRIES;

      return ALL_COUNTRIES.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const codeMatch = c.code.toLowerCase().includes(q);
        const dialClean = c.dialCode.replace("+", "");
        const queryClean = q.replace("+", "");
        const dialMatch = dialClean.startsWith(queryClean);
        return nameMatch || codeMatch || dialMatch;
      });
    }, [searchQuery]);

    // Country selection
    const handleSelectCountry = (country: Country) => {
      setSelectedCountry(country);
      setIsOpen(false);
      setSearchQuery("");

      const trimmedNumber = nationalNumber.trim();
      if (onChange) {
        onChange(trimmedNumber ? `${country.dialCode} ${trimmedNumber}` : "");
      }

      // Re-focus input
      setTimeout(() => {
        if (internalInputRef.current) {
          internalInputRef.current.focus();
        }
      }, 50);
    };

    // National number input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Handle user pasting a full international number with '+'
      if (raw.startsWith("+")) {
        const parsed = parsePhone(raw, ALL_COUNTRIES, selectedCountry);
        setSelectedCountry(parsed.country);
        setNationalNumber(parsed.nationalNumber);
        if (onChange) {
          onChange(
            parsed.nationalNumber ? `${parsed.country.dialCode} ${parsed.nationalNumber}` : ""
          );
        }
        return;
      }

      // Allow digits, spaces, hyphens, and parenthesis
      const cleaned = raw.replace(/[^\d\s\-()]/g, "");
      setNationalNumber(cleaned);

      if (onChange) {
        const trimmed = cleaned.trim();
        onChange(trimmed ? `${selectedCountry.dialCode} ${trimmed}` : "");
      }
    };

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-foreground cursor-pointer"
              onClick={() => internalInputRef.current?.focus()}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          </div>
        )}

        {/* Input & Prefix Dropdown Container */}
        <div
          className={cn(
            "flex h-10 w-full items-center rounded-lg border border-border bg-white transition-all shadow-xs",
            "focus-within:ring-2 focus-within:ring-navy focus-within:border-navy",
            error &&
              "border-destructive focus-within:ring-destructive focus-within:border-destructive",
            disabled && "opacity-50 cursor-not-allowed bg-muted/20",
            className
          )}
        >
          {/* Country Prefix Dropdown Trigger */}
          <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Select country code, currently ${selectedCountry.name} ${selectedCountry.dialCode}`}
                className={cn(
                  "flex h-full items-center gap-1.5 px-3 hover:bg-muted/40 transition-colors rounded-l-lg shrink-0 outline-none select-none cursor-pointer",
                  isOpen && "bg-muted/50"
                )}
                title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
              >
                <CountryFlag
                  code={selectedCountry.code}
                  name={selectedCountry.name}
                  flag={selectedCountry.flag}
                />
                <span className="font-medium text-xs text-foreground tracking-tight">
                  {selectedCountry.dialCode}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180 text-foreground"
                  )}
                />
              </button>
            </PopoverTrigger>

            {/* Dropdown Content */}
            <PopoverContent
              align="start"
              sideOffset={6}
              className="w-[300px] p-0 shadow-dropdown border-border rounded-xl bg-white overflow-hidden z-[100]"
            >
              {/* Search Box */}
              <div className="p-2 border-b border-border/70 bg-muted/15">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or dial code..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy text-foreground placeholder:text-muted-foreground/70 transition-colors"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List (Scrollable) */}
              <div className="max-h-60 overflow-y-auto divide-y divide-border/20 py-1 focus:outline-none">
                {filteredCountries.length === 0 ? (
                  <div className="py-7 text-center text-xs text-muted-foreground">
                    No country found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {/* Show Popular section header when not searching */}
                    {!searchQuery && (
                      <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/20 border-b border-border/30">
                        Popular Countries
                      </div>
                    )}

                    {!searchQuery &&
                      popularCountries.map((country) => {
                        const isSelected = selectedCountry.code === country.code;
                        return (
                          <button
                            key={`popular-${country.code}`}
                            type="button"
                            onClick={() => handleSelectCountry(country)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer",
                              isSelected && "bg-navy/5 font-semibold text-navy"
                            )}
                          >
                            <CountryFlag
                              code={country.code}
                              name={country.name}
                              flag={country.flag}
                            />
                            <span className="truncate flex-1 text-foreground">
                              {country.name}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground font-semibold px-1.5 py-0.5 rounded bg-muted/50 shrink-0">
                              {country.dialCode}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-navy shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}

                    {!searchQuery && (
                      <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/20 border-b border-border/30">
                        All Countries
                      </div>
                    )}

                    {filteredCountries.map((country) => {
                      const isSelected = selectedCountry.code === country.code;
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelectCountry(country)}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer",
                            isSelected && "bg-navy/5 font-semibold text-navy"
                          )}
                        >
                          <CountryFlag
                            code={country.code}
                            name={country.name}
                            flag={country.flag}
                          />
                          <span className="truncate flex-1 text-foreground">
                            {country.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground font-semibold px-1.5 py-0.5 rounded bg-muted/50 shrink-0">
                            {country.dialCode}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-navy shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-border shrink-0" />

          {/* National Number Input */}
          <input
            ref={(node) => {
              internalInputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            type="tel"
            id={inputId}
            disabled={disabled}
            value={nationalNumber}
            onChange={handleInputChange}
            placeholder={placeholder || selectedCountry.placeholder || "98765 43210"}
            className="h-full w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border-0 focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Error or Helper text */}
        {error ? (
          <p className="text-xs text-destructive mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
export { PhoneInput as FormPhoneInput };
