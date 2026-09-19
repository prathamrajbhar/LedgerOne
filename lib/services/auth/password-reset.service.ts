import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/client";
import { ValidationError } from "@/lib/utils/errors";
import { passwordService } from "./password.service";
import type { ResetTokenValidationResult } from "./auth.types";

export class PasswordResetService {
  /**
   * Request password reset token and dispatch email
   */
  async requestReset(email: string): Promise<{ success: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      select: { id: true, email: true, name: true, isActive: true },
    });

    // Return silently if user not found to prevent user enumeration
    if (!user || !user.isActive) {
      return { success: true };
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    try {
      await emailService.sendPasswordResetEmail(user.email, token, user.name);
    } catch {
      // Allow completion even if email delivery encounters issues in dev
    }

    return { success: true };
  }

  /**
   * Validate a password reset token
   */
  async validateToken(token: string): Promise<ResetTokenValidationResult> {
    if (!token || typeof token !== "string") {
      return { valid: false, message: "Reset token is missing or invalid." };
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return {
        valid: false,
        message: "This password reset link is invalid or has expired.",
      };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Reset user password using token
   */
  async resetWithToken(token: string, newPassword: string): Promise<{ success: boolean }> {
    if (!token || typeof token !== "string") {
      throw new ValidationError("Password reset token is required");
    }

    passwordService.validate(newPassword);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError("This password reset link is invalid or has expired.");
    }

    const hashedPassword = await passwordService.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        mustChangePassword: false,
      },
    });

    return { success: true };
  }
}

export const passwordResetService = new PasswordResetService();
