import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { authService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Add contact info for portal users
        if (user.contactId) {
          token.contactId = user.contactId;
          token.contactType = user.contactType;
          token.contactName = user.contactName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
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
