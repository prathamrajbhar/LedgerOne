import { describe, it, expect, beforeEach, vi } from "vitest";
import { signUpAction } from "@/app/actions/auth.actions";
import { UserRole } from "@prisma/client";

const { mockAuthService, mockEmailService } = vi.hoisted(() => {
  return {
    mockAuthService: {
      signUp: vi.fn(),
    },
    mockEmailService: {
      sendWelcomeEmail: vi.fn(),
    },
  };
});

vi.mock("@/lib/services/auth.service", () => ({
  authService: mockAuthService,
}));

vi.mock("@/lib/email/client", () => ({
  emailService: mockEmailService,
}));

describe("Sign Up Action - Administrator & Accountant Support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create administrator account successfully", async () => {
    mockAuthService.signUp.mockResolvedValue({
      id: "u-admin",
      loginId: "admin_corp",
      email: "director@furniture.com",
      name: "Amitabh Singhania",
      role: UserRole.ADMINISTRATOR,
    });

    const result = await signUpAction({
      name: "Amitabh Singhania",
      companyName: "Royal Furniture Corp",
      loginId: "admin_corp",
      email: "director@furniture.com",
      password: "Password@123",
      role: UserRole.ADMINISTRATOR,
    });

    expect(result.success).toBe(true);
    expect(mockAuthService.signUp).toHaveBeenCalledWith({
      name: "Amitabh Singhania",
      loginId: "admin_corp",
      email: "director@furniture.com",
      password: "Password@123",
      role: UserRole.ADMINISTRATOR,
    });
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      "director@furniture.com",
      "Amitabh Singhania",
      "Administrator"
    );
  });

  it("should create accountant account successfully", async () => {
    mockAuthService.signUp.mockResolvedValue({
      id: "u-acct",
      loginId: "acct_lead",
      email: "accountant@furniture.com",
      name: "Pooja Deshmukh",
      role: UserRole.ACCOUNTANT,
    });

    const result = await signUpAction({
      name: "Pooja Deshmukh",
      loginId: "acct_lead",
      email: "accountant@furniture.com",
      password: "Password@123",
      role: UserRole.ACCOUNTANT,
    });

    expect(result.success).toBe(true);
    expect(mockAuthService.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.ACCOUNTANT,
      })
    );
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      "accountant@furniture.com",
      "Pooja Deshmukh",
      "Accountant"
    );
  });

  it("should reject login IDs shorter than 6 characters", async () => {
    const result = await signUpAction({
      name: "Test User",
      loginId: "adm",
      email: "test@example.com",
      password: "Password@123",
      role: UserRole.ADMINISTRATOR,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Login ID must be at least 6 characters");
  });

  it("should reject weak passwords missing special symbols", async () => {
    const result = await signUpAction({
      name: "Test User",
      loginId: "valid_admin",
      email: "test@example.com",
      password: "Password123",
      role: UserRole.ADMINISTRATOR,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Password must contain at least one special character");
  });
});
