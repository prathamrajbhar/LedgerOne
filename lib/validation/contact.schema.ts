import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
