import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { emailService } from "@/lib/email/client";
import { ValidationError, ConflictError, UnauthorizedError } from "@/lib/utils/errors";
import { passwordService } from "./password.service";
import type { InviteContactToPortalInput, PortalInvitationResult } from "./auth.types";

export class PortalAuthService {
  /**
   * Invite contact to portal (creates Contact-role login credentials)
   */
  async inviteContact(input: InviteContactToPortalInput): Promise<PortalInvitationResult> {
    const inviter = await prisma.user.findUnique({
      where: { id: input.invitedByUserId },
    });

    if (!inviter || inviter.role === UserRole.CONTACT) {
      throw new UnauthorizedError("Unauthorized to invite portal contacts");
    }

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

    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: contact.email },
    });
    if (existingUserWithEmail) {
      throw new ConflictError(
        `A system user with email "${contact.email}" already exists (Login ID: ${existingUserWithEmail.loginId}).`
      );
    }

    const tempPassword = passwordService.generateTemporary();
    const hashedPassword = await passwordService.hash(tempPassword);

    const latestPortalUser = await prisma.user.findFirst({
      where: {
        role: UserRole.CONTACT,
        loginId: { startsWith: "cust" },
      },
      orderBy: { loginId: "desc" },
      select: { loginId: true },
    });

    let nextNumber = 1;
    if (latestPortalUser?.loginId) {
      const match = latestPortalUser.loginId.match(/^cust(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const generatedLoginId = `cust${String(nextNumber).padStart(3, "0")}`;

    const user = await prisma.user.create({
      data: {
        loginId: generatedLoginId,
        email: contact.email,
        password: hashedPassword,
        role: UserRole.CONTACT,
        mustChangePassword: true,
        contact: {
          connect: { id: contact.id },
        },
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await emailService.sendPortalInvitation(
        contact.email,
        user.loginId,
        tempPassword,
        contact.name
      );
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Failed to send portal invitation email";
    }

    return {
      userId: user.id,
      loginId: user.loginId,
      temporaryPassword: tempPassword,
      emailSent,
      emailError,
    };
  }

  /**
   * Resend portal invitation with a freshly rotated temporary password
   */
  async resendInvitation(userId: string, requestedByUserId: string): Promise<PortalInvitationResult> {
    const inviter = await prisma.user.findUnique({
      where: { id: requestedByUserId },
    });

    if (!inviter || inviter.role === UserRole.CONTACT) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { contact: true },
    });

    if (!user || user.role !== UserRole.CONTACT || !user.contact) {
      throw new ValidationError("Only portal contacts can receive invitation emails");
    }

    const tempPassword = passwordService.generateTemporary();
    const hashedPassword = await passwordService.hash(tempPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        mustChangePassword: true,
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await emailService.sendPortalInvitation(
        user.email,
        user.loginId,
        tempPassword,
        user.contact.name
      );
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Failed to send email";
    }

    return {
      userId: user.id,
      loginId: user.loginId,
      temporaryPassword: tempPassword,
      emailSent,
      emailError,
    };
  }
}

export const portalAuthService = new PortalAuthService();
