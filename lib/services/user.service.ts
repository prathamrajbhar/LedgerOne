import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ValidationError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  loginId?: string;
}

export interface InviteContactInput {
  name: string;
  email: string;
  phone?: string;
  type?: "CUSTOMER" | "VENDOR" | "BOTH";
}

export class UserService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
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
    if (!input.email || !input.password) {
      throw new ValidationError("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const count = await prisma.user.count();
    const loginId = input.loginId || `USR${String(count + 1).padStart(4, "0")}`;

    return prisma.user.create({
      data: {
        loginId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        isActive: true,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async inviteContact(input: InviteContactInput | string, emailArg?: string) {
    let name = "";
    let email = "";
    let phone: string | undefined;
    let type: "CUSTOMER" | "VENDOR" | "BOTH" = "CUSTOMER";
    let contact = null;

    if (typeof input === "string") {
      contact = await prisma.contact.findUnique({
        where: { id: input },
      });
      if (contact) {
        name = contact.name;
        email = emailArg || contact.email || "";
        type = contact.type;
      } else {
        email = emailArg || "";
        name = email.split("@")[0] || "User";
      }
    } else {
      name = input.name;
      email = input.email;
      phone = input.phone;
      type = input.type || "CUSTOMER";
    }

    if (!email) {
      throw new ValidationError("Email is required to invite contact");
    }

    if (!contact) {
      contact = await prisma.contact.findUnique({
        where: { email },
      });
    }

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name,
          email,
          phone,
          type,
        },
      });
    }

    // Check if user already exists for contact
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { contact, user: existingUser, invited: true };
    }

    // Generate random initial password
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const count = await prisma.user.count();
    const loginId = `PORTAL${String(count + 1).padStart(4, "0")}`;

    const user = await prisma.user.create({
      data: {
        loginId,
        name,
        email,
        password: hashedPassword,
        role: UserRole.CONTACT,
        isActive: true,
        contact: {
          connect: { id: contact.id },
        },
      },
    });

    return { contact, user, tempPassword, invited: true };
  }
}

export const userService = new UserService();
