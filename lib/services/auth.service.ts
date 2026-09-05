/**
 * Auth Service
 * Handles user authentication, session management, and portal invitations
 */

import { PrismaClient, UserRole } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { ValidationError, UnauthorizedError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface SignUpInput {
  loginId: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  loginId?: string;
  email?: string;
  password: string;
}

export interface CreateUserInput {
  loginId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface InviteContactToPortalInput {
  contactId: string;
  invitedByUserId: string;
}

export class AuthService {
  /**
   * Self-service sign up for Accountant role
   */
  async signUp(input: SignUpInput) {
    // Validate login ID (6-12 characters)
    if (input.loginId.length < 6 || input.loginId.length > 12) {
      throw new ValidationError("Login ID must be 6-12 characters");
    }

    // Validate password complexity
    this.validatePassword(input.password);

    // Check uniqueness
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

    // Hash password
    const hashedPassword = await hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        loginId: input.loginId,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: UserRole.ACCOUNTANT,
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  }

  /**
   * Login with credentials
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: input.loginId
        ? { loginId: input.loginId }
        : input.email
        ? { email: input.email }
        : { loginId: "" },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid Login ID or Password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isValidPassword = await compare(input.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid Login ID or Password");
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Admin creates internal user (Admin or Accountant)
   */
  async createUser(input: CreateUserInput, createdByUserId: string) {
    // Only Administrator can create users
    const createdBy = await this.verifyAdministrator(createdByUserId);

    // Validate
    if (input.loginId.length < 6 || input.loginId.length > 12) {
      throw new ValidationError("Login ID must be 6-12 characters");
    }

    this.validatePassword(input.password);

    // Check uniqueness
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

    // Hash password
    const hashedPassword = await hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
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

    return user;
  }

  /**
   * Invite contact to portal (creates Contact-role login)
   */
  async inviteContactToPortal(input: InviteContactToPortalInput) {
    // Verify the inviter has permission (Admin or Accountant)
    await this.verifyInternalUser(input.invitedByUserId);

    // Get contact
    const contact = await prisma.contact.findUnique({
      where: { id: input.contactId },
      include: { user: true },
    });

    if (!contact) {
      throw new ValidationError("Contact not found");
    }

    if (contact.userId) {
      throw new ConflictError("Contact already has portal access");
    }

    // Generate temporary password (should be sent via email with reset link)
    const tempPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(tempPassword, 12);

    // Create Contact-role user and link to contact
    const user = await prisma.user.create({
      data: {
        loginId: `contact_${contact.id.slice(0, 8)}`,
        email: contact.email,
        password: hashedPassword,
        role: UserRole.CONTACT,
        contact: {
          connect: { id: contact.id },
        },
      },
    });

    // TODO: Send email with credentials and password reset link

    return {
      userId: user.id,
      loginId: user.loginId,
      temporaryPassword: tempPassword, // Only for initial setup
    };
  }

  // Private helper methods

  private validatePassword(password: string) {
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasSpecial) {
      throw new ValidationError(
        "Password must contain uppercase, lowercase, and special character"
      );
    }
  }

  private async verifyAdministrator(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.ADMINISTRATOR) {
      throw new UnauthorizedError("Only Administrator can perform this action");
    }

    return user;
  }

  private async verifyInternalUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role === UserRole.CONTACT) {
      throw new UnauthorizedError("Unauthorized");
    }

    return user;
  }

  private generateTemporaryPassword(): string {
    // Generate a random 12-character password with required complexity
    const length = 12;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += special[Math.floor(Math.random() * special.length)];

    const all = uppercase + lowercase + numbers + special;
    for (let i = 3; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}

export const authService = new AuthService();
