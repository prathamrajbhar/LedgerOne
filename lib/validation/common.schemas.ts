import { z } from "zod";

export const journalSchema = z.object({
  name: z.string().min(2, "Journal name is required"),
  code: z.string().min(2, "Journal code is required").max(5),
  type: z.enum(["SALES", "PURCHASE", "BANK", "CASH", "GENERAL"]),
  defaultAccountId: z.string().optional(),
});

export type JournalFormData = z.infer<typeof journalSchema>;

export const taxRateSchema = z.object({
  name: z.string().min(2, "Tax name is required"),
  rate: z.coerce.number().min(0).max(100, "Rate must be between 0 and 100"),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  scope: z.enum(["SALES", "PURCHASE", "BOTH"]).default("BOTH"),
});

export type TaxRateFormData = z.infer<typeof taxRateSchema>;

export const analyticAccountSchema = z.object({
  name: z.string().min(2, "Analytic account name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export type AnalyticAccountFormData = z.infer<typeof analyticAccountSchema>;

export const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  loginId: z.string().min(6, "Login ID must be 6-12 characters").max(12),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one digit"),
  companyName: z.string().optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
