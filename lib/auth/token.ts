import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createHash, randomBytes } from "crypto";
import { UserRole, ContactType } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default_jwt_secret_must_be_overridden_in_env_32chars"
);

export interface SessionTokenPayload extends JWTPayload {
  id: string;
  email: string;
  loginId: string;
  name?: string | null;
  role: UserRole;
  contactId?: string | null;
  contactType?: ContactType | null;
  contactName?: string | null;
  mustChangePassword?: boolean;
}

/**
 * Sign a new JWT session access token
 */
export async function signAccessToken(
  payload: Omit<SessionTokenPayload, "iat" | "exp">,
  expiresIn: string = "15m"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT session access token
 */
export async function verifyAccessToken(
  token: string
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionTokenPayload;
  } catch {
    return null;
  }
}

/**
 * SHA-256 hash for secure token storage
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure random token string
 */
export function generateRandomToken(bytes: number = 32): string {
  return randomBytes(bytes).toString("hex");
}
