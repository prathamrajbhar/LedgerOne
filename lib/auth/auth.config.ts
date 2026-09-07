import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { authService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { checkUserStatus } from "./user-status";
import { refreshTokenService } from "@/lib/services/refresh-token.service";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const STATUS_CHECK_INTERVAL_MS = 60 * 1000;

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
      // Initial sign in - populate token & generate initial refresh token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        if (user.contactId) {
          token.contactId = user.contactId;
          token.contactType = user.contactType;
          token.contactName = user.contactName;
        }

        try {
          const refreshTokenRecord = await refreshTokenService.generateRefreshToken(user.id);
          token.refreshToken = refreshTokenRecord.rawToken;
          token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
          token.lastStatusCheck = Date.now();
        } catch {
          return null;
        }
      }

      // Handle session updates (e.g., password change completion)
      if (trigger === "update" && session) {
        if (typeof session.mustChangePassword === "boolean") {
          token.mustChangePassword = session.mustChangePassword;
        }
      }

      if (!token.id || !token.role) {
        return null;
      }

      const now = Date.now();

      // Throttled status check: validate user active status every 60s
      const shouldCheckStatus = !token.lastStatusCheck || now - token.lastStatusCheck > STATUS_CHECK_INTERVAL_MS;
      if (shouldCheckStatus) {
        try {
          const status = await checkUserStatus(
            token.id as string,
            token.role as UserRole,
            token.contactId as string | undefined
          );

          if (status.shouldLogout) {
            await refreshTokenService.revokeAllUserTokens(token.id as string);
            return null;
          }
          token.lastStatusCheck = now;
        } catch {
          return null;
        }
      }

      // Refresh Token Rotation: If access token expired, rotate refresh token
      const isAccessTokenExpired = token.accessTokenExpires ? now >= token.accessTokenExpires : false;
      if (isAccessTokenExpired) {
        if (!token.refreshToken) {
          return null;
        }

        try {
          const rotated = await refreshTokenService.rotateRefreshToken(token.refreshToken);
          token.refreshToken = rotated.rawToken;
          token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
        } catch {
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is null (user was logged out), return null session
      if (!token) {
        return null as unknown as typeof session;
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
