"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/email/client";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { auth } from "@/lib/auth/auth.config";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  loginId: z
    .string()
    .min(6, "Login ID must be 6-12 characters")
    .max(12, "Login ID must be 6-12 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Login ID can only contain letters, numbers, dots, and underscores"),
  email: z.string().email("Invalid email address"),
  password: passwordRule,
  companyName: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.ACCOUNTANT).optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Sign up a new user with rate limiting and validation
 */
export async function signUpAction(data: SignUpFormData): Promise<ActionResult> {
  try {
    const rateCheck = checkRateLimit({
      key: `signup:${data.email || "ip"}`,
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return {
        success: false,
        error: `Too many registration attempts. Please try again in ${rateCheck.retryAfterSeconds}s.`,
      };
    }

    const validatedData = signUpSchema.parse(data);

    const user = await authService.signUp({
      loginId: validatedData.loginId,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      role: validatedData.role,
    });

    try {
      const roleLabel = user.role === UserRole.ADMINISTRATOR ? "Administrator" : "Accountant";
      await emailService.sendWelcomeEmail(user.email, user.name || user.loginId, roleLabel);
    } catch {
      // Non-blocking welcome email delivery
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create account" };
  }
}

/**
 * Get destination path for user after login based on role
 */
export async function getPostLoginRedirectAction(identifier: string): Promise<string> {
  try {
    const trimmed = identifier.trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ loginId: trimmed }, { email: trimmed }] },
      select: { role: true },
    });

    return user?.role === UserRole.CONTACT ? "/portal/dashboard" : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/**
 * Request password reset link via email with rate limiting
 */
export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse({ email });

    const rateCheck = checkRateLimit({
      key: `reset_req:${validated.email.toLowerCase()}`,
      limit: 3,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return {
        success: false,
        error: `Too many reset requests. Please retry in ${rateCheck.retryAfterSeconds}s.`,
      };
    }

    await authService.requestPasswordReset(validated.email);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Invalid email" };
    }
    const err = error as Error;
    return { success: false, error: err.message || "Failed to process password reset" };
  }
}

/**
 * Verify password reset token
 */
export async function validateResetTokenAction(token: string) {
  try {
    return await authService.validateResetToken(token);
  } catch {
    return { valid: false, message: "An unexpected error occurred while verifying token." };
  }
}

const resetPasswordWithTokenSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Reset user password with token
 */
export async function resetPasswordAction(data: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const validated = resetPasswordWithTokenSchema.parse(data);
    await authService.resetPasswordWithToken(validated.token, validated.password);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    const err = error as Error;
    return { success: false, error: err.message || "Failed to reset password" };
  }
}

const changePasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Change temporary password on first login
 */
export async function changeTemporaryPasswordAction(data: {
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const validated = changePasswordSchema.parse(data);
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    await authService.updateTemporaryPassword(session.user.id, validated.newPassword);
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    const err = error as Error;
    return { success: false, error: err.message || "Failed to update password" };
  }
}
