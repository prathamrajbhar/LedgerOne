"use server";

import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/email/client";
import { z } from "zod";

// Validation schemas
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  loginId: z
    .string()
    .min(6, "Login ID must be at least 6 characters")
    .max(12, "Login ID must be at most 12 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Login ID can only contain letters, numbers, dots, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  companyName: z.string().optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Sign up a new accountant user
 */
export async function signUpAction(data: SignUpFormData): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data);

    // Create user
    const user = await authService.signUp({
      loginId: validatedData.loginId,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name || user.loginId);
    } catch (emailError) {
      // Log but don't fail the signup if email fails
      console.error("Failed to send welcome email:", emailError);
    }

  } catch (error: unknown) {
    console.error("Sign up error:", error);

    const err = error as Error & { name?: string };

    // Handle specific error types
    if (err.name === "ZodError") {
      const zodError = error as z.ZodError;
      return {
        success: false,
        error: zodError.errors[0]?.message || "Validation failed",
      };
    }

    if (err.message?.includes("Login ID already exists")) {
      return {
        success: false,
        error: "This Login ID is already taken. Please choose another.",
      };
    }

    if (err.message?.includes("Email already exists")) {
      return {
        success: false,
        error: "This email is already registered. Please use a different email or sign in.",
      };
    }

    if (err.message?.includes("Password must contain")) {
      return { success: false, error: err.message };
    }

    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Request password reset (BLOCKED)
 *
 * NOTE: This functionality requires a password reset token storage mechanism
 * which does not exist in the current database schema. The following would be needed:
 *
 * 1. A PasswordResetToken model in Prisma schema with:
 *    - token: String (unique, indexed)
 *    - userId: String (relation to User)
 *    - expiresAt: DateTime
 *    - used: Boolean
 *
 * 2. Service methods in auth.service.ts:
 *    - requestPasswordReset(email): generates token, stores in DB, sends email
 *    - validateResetToken(token): checks if token exists and is valid
 *    - resetPassword(token, newPassword): validates token and updates password
 *
 * 3. A reset password page at /reset-password that accepts token query param
 */
export async function requestPasswordResetAction(_email: string): Promise<ActionResult> {
  // BLOCKED: Cannot implement without database schema support for password reset tokens
  throw new Error(
    "Password reset functionality requires database schema changes. " +
    "Please add a PasswordResetToken model to the Prisma schema before implementing this feature."
  );
}
