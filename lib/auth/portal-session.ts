import { auth } from "./auth.config";
import { UnauthorizedError } from "../utils/errors";
import { UserRole, ContactType } from "@prisma/client";

/**
 * Portal-specific session helpers
 * These ensure contact-scoped access and security
 */

export interface PortalSession {
  userId: string;
  contactId: string;
  contactType: ContactType;
  contactName: string;
  email: string;
}

/**
 * Get current portal session
 * Returns null if not a contact user
 */
export async function getPortalSession(): Promise<PortalSession | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Only CONTACT role users can access portal
  if (session.user.role !== UserRole.CONTACT || !session.user.contactId) {
    return null;
  }

  return {
    userId: session.user.id,
    contactId: session.user.contactId,
    contactType: session.user.contactType || ContactType.CUSTOMER,
    contactName: session.user.contactName || session.user.name || "User",
    email: session.user.email,
  };
}

/**
 * Require portal authentication
 * Throws if user is not authenticated as a contact
 */
export async function requirePortalAuth(): Promise<PortalSession> {
  const portalSession = await getPortalSession();

  if (!portalSession) {
    throw new UnauthorizedError("Portal authentication required");
  }

  return portalSession;
}

/**
 * Check if contact is a customer (can view invoices)
 */
export async function requireCustomerAccess(): Promise<PortalSession> {
  const portalSession = await requirePortalAuth();

  if (
    portalSession.contactType !== ContactType.CUSTOMER &&
    portalSession.contactType !== ContactType.BOTH
  ) {
    throw new UnauthorizedError("Customer access required");
  }

  return portalSession;
}

/**
 * Check if contact is a vendor (can view bills)
 */
export async function requireVendorAccess(): Promise<PortalSession> {
  const portalSession = await requirePortalAuth();

  if (
    portalSession.contactType !== ContactType.VENDOR &&
    portalSession.contactType !== ContactType.BOTH
  ) {
    throw new UnauthorizedError("Vendor access required");
  }

  return portalSession;
}
