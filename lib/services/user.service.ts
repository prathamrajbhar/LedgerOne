/**
 * User Management Service
 * Manages user accounts, roles, and contact portal invitations
 */

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateUserInput {
  loginId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  contactId?: string;
}

export class UserService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(input: CreateUserInput) {
    if (!input.email || !input.loginId || !input.password) {
      throw new ValidationError("Login ID, Email, and Password are required");
    }

    const [existingLogin, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { loginId: input.loginId } }),
      prisma.user.findUnique({ where: { email: input.email } }),
    ]);

    if (existingLogin) throw new ConflictError("Login ID already in use");
    if (existingEmail) throw new ConflictError("Email already in use");

    const hashedPassword = await bcrypt.hash(input.password, 10);

    return prisma.user.create({
      data: {
        loginId: input.loginId,
        email: input.email,
        name: input.name,
        password: hashedPassword,
        role: input.role,
        contact: input.contactId
          ? {
              connect: { id: input.contactId },
            }
          : undefined,
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

  async inviteContact(contactId: string, email: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { user: true },
    });

    if (!contact) throw new NotFoundError("Contact not found");
    if (contact.user) throw new ConflictError("Contact already has portal access");

    const loginId = `c_${contact.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}_${Math.floor(10 + Math.random() * 90)}`;
    const tempPassword = `Portal@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        name: contact.name,
        password: hashedPassword,
        role: UserRole.CONTACT,
        contact: {
          connect: { id: contact.id },
        },
      },
    });

    return {
      user,
      tempPassword,
      message: `Portal invite generated for ${contact.name}`,
    };
  }
}

export const userService = new UserService();
