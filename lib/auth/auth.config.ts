import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { authService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { checkUserStatus } from "./user-status";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Unified login (Admin, Accountant, and Contact Portal users) - uses loginId or email
    CredentialsProvider({
      id: "credentials",
      name: "Unified Login",
      credentials: {
        loginId: { label: "Login ID or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) {
          return null;
        }

        try {
          const result = await authService.login({
            loginId: credentials.loginId as string,
            password: credentials.password as string,
          });

          return {
            id: result.id,
            email: result.email,
            name: result.name || result.contact?.name || result.loginId,
            role: result.role,
            contactId: result.contact?.id,
            contactType: result.contact?.type,
            contactName: result.contact?.name,
            mustChangePassword: result.mustChangePassword,
          };
        } catch {
          return null;
        }
      },
    }),
    // Portal login (Contact) - uses email
    CredentialsProvider({
      id: "portal-credentials",
      name: "Portal Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await authService.authenticateContact({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          // Only allow CONTACT role
          if (result.role !== UserRole.CONTACT || !result.contact) {
            return null;
          }

          return {
            id: result.id,
            email: result.email,
            name: result.name,
            role: result.role,
            contactId: result.contact.id,
            contactType: result.contact.type,
            contactName: result.contact.name,
            mustChangePassword: result.mustChangePassword,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - populate token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        // Add contact info for portal users
        if (user.contactId) {
          token.contactId = user.contactId;
          token.contactType = user.contactType;
          token.contactName = user.contactName;
        }
      }

      // Handle session updates (e.g., password change completion)
      if (trigger === "update" && session) {
        if (typeof session.mustChangePassword === "boolean") {
          token.mustChangePassword = session.mustChangePassword;
        }
      }

      // CRITICAL SECURITY CHECK: Validate user status on every request
      // This ensures deactivated/deleted users are logged out across all devices
      if (token.id && token.role) {
        try {
          const status = await checkUserStatus(
            token.id as string,
            token.role as UserRole,
            token.contactId as string | undefined
          );

          // If user should be logged out, return null to invalidate the token
          if (status.shouldLogout) {
            console.warn(
              `User ${token.id} session invalidated:`,
              !status.exists
                ? "User deleted"
                : !status.isActive
                  ? "User deactivated"
                  : status.isContactArchived
                    ? "Contact archived"
                    : "Access revoked"
            );
            return null;
          }
        } catch (error) {
          // On error checking status, invalidate session for security
          console.error("Error validating user session:", error);
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is null (user was logged out), return null session
      if (!token) {
        return null as any;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.mustChangePassword = token.mustChangePassword as boolean | undefined;
        // Add contact info for portal users
        if (token.contactId) {
          session.user.contactId = token.contactId as string;
          session.user.contactType = token.contactType as import("@prisma/client").ContactType;
          session.user.contactName = token.contactName as string;
        }
      }
      return session;
    },
  },
});
