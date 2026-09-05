"use server";

import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/email/client";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  role: z.nativeEnum(UserRole).default(UserRole.ACCOUNTANT).optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Sign up a new user
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
      role: validatedData.role,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name || user.loginId);
    } catch (emailError) {
      // Log but don't fail the signup if email fails
      console.error("Failed to send welcome email:", emailError);
    }

    return { success: true };
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
 * Get destination path for user after login based on their role
 */
export async function getPostLoginRedirectAction(identifier: string): Promise<string> {
  try {
    const trimmed = identifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: trimmed }, { email: trimmed }],
      },
      select: { role: true },
    });

    if (user?.role === UserRole.CONTACT) {
      return "/portal/dashboard";
    }
    return "/dashboard";
  } catch {
    return "/dashboard";
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordWithTokenSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Request password reset link via email
 */
export async function requestPasswordResetAction(
  email: string
): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse({ email });
    await authService.requestPasswordReset(validated.email);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid email address",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to process password reset request",
    };
  }
}

/**
 * Verify validity of a password reset token
 */
export async function validateResetTokenAction(
  token: string
): Promise<{ valid: boolean; email?: string; name?: string | null; message?: string }> {
  try {
    return await authService.validateResetToken(token);
  } catch {
    return {
      valid: false,
      message: "An unexpected error occurred while verifying the reset token.",
    };
  }
}

/**
 * Execute password reset with token
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
      return {
        success: false,
        error: error.errors[0]?.message || "Validation failed",
      };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to reset password. Please try again.",
    };
  }
}

const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function changeTemporaryPasswordAction(data: {
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const validated = changePasswordSchema.parse(data);

    // Get current session user
    const { auth } = await import("@/lib/auth/auth.config");
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    await authService.updateTemporaryPassword(session.user.id, validated.newPassword);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Validation failed",
      };
    }

    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to update password",
    };
  }
}

