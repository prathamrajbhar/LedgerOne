import { UserRole, ContactType } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    contactId?: string;
    contactType?: ContactType;
    contactName?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      contactId?: string;
      contactType?: ContactType;
      contactName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    contactId?: string;
    contactType?: ContactType;
    contactName?: string;
  }
}
