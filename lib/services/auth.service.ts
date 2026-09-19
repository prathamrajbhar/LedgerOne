import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { ValidationError, UnauthorizedError, ConflictError } from "@/lib/utils/errors";
import { passwordService } from "./auth/password.service";
import { passwordResetService } from "./auth/password-reset.service";
import { portalAuthService } from "./auth/portal-auth.service";
import type {
  SignUpInput,
  LoginInput,
  ContactLoginInput,
  CreateUserInput,
  InviteContactToPortalInput,
  PortalInvitationResult,
  ResetTokenValidationResult,
  AuthenticatedUser,
} from "./auth/auth.types";

export * from "./auth/auth.types";

export class AuthService {
  /**
   * Self-service sign up for Accountant role
   */
  async signUp(input: SignUpInput) {
    if (input.loginId.length < 6 || input.loginId.length > 12) {
      throw new ValidationError("Login ID must be 6-12 characters");
    }

    passwordService.validate(input.password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: input.loginId }, { email: input.email }],
      },
    });

    if (existingUser) {
      if (existingUser.loginId === input.loginId) {
        throw new ConflictError("Login ID already exists");
      }
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await passwordService.hash(input.password);

    return prisma.user.create({
      data: {
        loginId: input.loginId,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || UserRole.ACCOUNTANT,
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  /**
   * Unified login for all roles (by loginId or email)
   */
  async login(input: LoginInput): Promise<AuthenticatedUser> {
    const identifier = input.loginId.trim();
    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: identifier, mode: "insensitive" } }
        : { loginId: identifier },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            phone: true,
            address: true,
            profileImage: true,
            isArchived: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid Login ID or Password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    if (user.contact?.isArchived) {
      throw new UnauthorizedError("Contact account is archived");
    }

    const isValidPassword = await passwordService.compare(input.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid Login ID or Password");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Contact portal login by email
   */
  async authenticateContact(input: ContactLoginInput): Promise<AuthenticatedUser> {
    return this.login({ loginId: input.email, password: input.password });
  }

  /**
   * Admin creates internal user
   */
  async createUser(input: CreateUserInput, createdByUserId: string) {
    const admin = await prisma.user.findUnique({ where: { id: createdByUserId } });
    if (!admin || admin.role !== UserRole.ADMINISTRATOR) {
      throw new UnauthorizedError("Only Administrator can perform this action");
    }

    if (input.loginId.length < 6 || input.loginId.length > 12) {
      throw new ValidationError("Login ID must be 6-12 characters");
    }

    passwordService.validate(input.password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: input.loginId }, { email: input.email }],
      },
    });

    if (existingUser) {
      if (existingUser.loginId === input.loginId) {
        throw new ConflictError("Login ID already exists");
      }
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await passwordService.hash(input.password);

    return prisma.user.create({
      data: {
        loginId: input.loginId,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role,
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Update temporary password upon first login
   */
  async updateTemporaryPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
    passwordService.validate(newPassword);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ValidationError("User not found");
    }

    const hashedPassword = await passwordService.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { success: true };
  }

  // Delegated methods
  inviteContactToPortal(input: InviteContactToPortalInput): Promise<PortalInvitationResult> {
    return portalAuthService.inviteContact(input);
  }

  resendPortalInvitation(userId: string, requestedByUserId: string): Promise<PortalInvitationResult> {
    return portalAuthService.resendInvitation(userId, requestedByUserId);
  }

  requestPasswordReset(email: string): Promise<{ success: boolean }> {
    return passwordResetService.requestReset(email);
  }

  validateResetToken(token: string): Promise<ResetTokenValidationResult> {
    return passwordResetService.validateToken(token);
  }

  resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean }> {
    return passwordResetService.resetWithToken(token, newPassword);
  }
}

export const authService = new AuthService();
