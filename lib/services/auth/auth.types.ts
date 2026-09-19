import { UserRole, ContactType } from "@prisma/client";

export interface SignUpInput {
  loginId: string;
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface LoginInput {
  loginId: string;
  password: string;
}

export interface ContactLoginInput {
  email: string;
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

export interface PortalInvitationResult {
  userId: string;
  loginId: string;
  temporaryPassword: string;
  emailSent: boolean;
  emailError: string | null;
}

export interface ResetTokenValidationResult {
  valid: boolean;
  email?: string;
  name?: string | null;
  message?: string;
}

export interface AuthenticatedUser {
  id: string;
  loginId: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  contact?: {
    id: string;
    name: string;
    type: ContactType;
    email: string;
    phone: string | null;
    address: string | null;
    profileImage: string | null;
    isArchived: boolean;
  } | null;
}
