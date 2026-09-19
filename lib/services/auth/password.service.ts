import { hash, compare } from "bcryptjs";
import { ValidationError } from "@/lib/utils/errors";

const BCRYPT_SALT_ROUNDS = 12;

export class PasswordService {
  /**
   * Validate password complexity requirements
   */
  validate(password: string): void {
    if (!password || password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasSpecial) {
      throw new ValidationError(
        "Password must contain uppercase, lowercase, and special character"
      );
    }
  }

  /**
   * Hash a plain text password using bcrypt with 12 rounds
   */
  async hash(password: string): Promise<string> {
    return hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compare a plain text password against a bcrypt hash
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  /**
   * Generate an enterprise temporary password satisfying complexity rules
   */
  generateTemporary(): string {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%^&*";

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    const allChars = uppercase + lowercase + numbers + special;
    for (let index = 4; index < 12; index += 1) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}

export const passwordService = new PasswordService();
