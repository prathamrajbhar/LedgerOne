import { z } from "zod";

export const accountSchema = z.object({
  code: z.string().min(3, "Account code must be at least 3 digits").optional(),
  name: z.string().min(2, "Account name is required"),
  type: z.enum([
    "ASSET",
    "LIABILITY",
    "BANK",
    "CAPITAL",
    "CASH",
    "INCOME",
    "EXPENSES",
    "OTHER_EXPENSES",
  ]),
  description: z.string().optional(),
  openingBalance: z.coerce.number().default(0),
});

export type AccountFormData = z.infer<typeof accountSchema>;
