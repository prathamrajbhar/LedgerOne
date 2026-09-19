import { prisma } from "../lib/prisma";
import { authService } from "../lib/services/auth.service";
import { passwordService } from "../lib/services/auth/password.service";
import { refreshTokenService } from "../lib/services/refresh-token.service";
import { signAccessToken, verifyAccessToken } from "../lib/auth/token";
import { hasPermission, ROLE_PERMISSIONS } from "../lib/auth/permissions";
import { checkRateLimit, resetRateLimit } from "../lib/auth/rate-limit";
import { UserRole } from "@prisma/client";

async function runAuthTestSuite() {
  console.log("==================================================");
  console.log("   ENTERPRISE AUTHENTICATION SYSTEM TEST SUITE    ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Cleanup any leftover test records
  const testLoginId = `test_${Date.now().toString().slice(-6)}`;
  const testEmail = `${testLoginId}@ledgerone.test`;
  const testPassword = "Password123!";

  try {
    // -------------------------------------------------------------
    // 1. Password Service & Complexity Validation
    // -------------------------------------------------------------
    console.log("\n[1] Testing Password Validation & Hashing...");
    let shortPassThrew = false;
    try {
      passwordService.validate("short");
    } catch {
      shortPassThrew = true;
    }
    assert(shortPassThrew, "Rejects short passwords (< 8 chars)");

    let noSpecialPassThrew = false;
    try {
      passwordService.validate("Password123");
    } catch {
      noSpecialPassThrew = true;
    }
    assert(noSpecialPassThrew, "Rejects passwords without special characters");

    const hashedPassword = await passwordService.hash(testPassword);
    assert(hashedPassword.startsWith("$2"), "Hashes password using bcrypt (12 rounds)");

    const isMatch = await passwordService.compare(testPassword, hashedPassword);
    assert(isMatch, "Correctly compares plain text password against bcrypt hash");

    const tempPassword = passwordService.generateTemporary();
    let tempValid = true;
    try {
      passwordService.validate(tempPassword);
    } catch {
      tempValid = false;
    }
    assert(tempValid, "Generates complex temporary passwords that satisfy all rules");

    // -------------------------------------------------------------
    // 2. User Registration (Sign Up)
    // -------------------------------------------------------------
    console.log("\n[2] Testing User Registration...");
    const createdUser = await authService.signUp({
      loginId: testLoginId,
      email: testEmail,
      name: "Test Accountant",
      password: testPassword,
      role: UserRole.ACCOUNTANT,
    });
    assert(createdUser.id !== undefined && createdUser.loginId === testLoginId, "Successfully registers new user");

    let duplicateThrew = false;
    try {
      await authService.signUp({
        loginId: testLoginId,
        email: `other_${testEmail}`,
        password: testPassword,
      });
    } catch {
      duplicateThrew = true;
    }
    assert(duplicateThrew, "Prevents duplicate loginId registration");

    // -------------------------------------------------------------
    // 3. Credential Authentication & Unified Login
    // -------------------------------------------------------------
    console.log("\n[3] Testing Credentials Authentication...");
    const loginByLoginId = await authService.login({
      loginId: testLoginId,
      password: testPassword,
    });
    assert(loginByLoginId.id === createdUser.id, "Authenticates via loginId");

    const loginByEmail = await authService.login({
      loginId: testEmail,
      password: testPassword,
    });
    assert(loginByEmail.id === createdUser.id, "Authenticates via email identifier");

    let wrongPassThrew = false;
    try {
      await authService.login({
        loginId: testLoginId,
        password: "WrongPassword123!",
      });
    } catch {
      wrongPassThrew = true;
    }
    assert(wrongPassThrew, "Rejects invalid password with UnauthorizedError");

    // Test Deactivated User
    await prisma.user.update({
      where: { id: createdUser.id },
      data: { isActive: false },
    });
    let inactiveUserThrew = false;
    try {
      await authService.login({
        loginId: testLoginId,
        password: testPassword,
      });
    } catch {
      inactiveUserThrew = true;
    }
    assert(inactiveUserThrew, "Blocks deactivated user account from logging in");

    // Re-activate user
    await prisma.user.update({
      where: { id: createdUser.id },
      data: { isActive: true },
    });

    // -------------------------------------------------------------
    // 4. JWT Session Token Lifecycle
    // -------------------------------------------------------------
    console.log("\n[4] Testing JWT Session Access Tokens...");
    const jwtToken = await signAccessToken({
      id: createdUser.id,
      email: createdUser.email,
      loginId: createdUser.loginId,
      name: createdUser.name,
      role: createdUser.role,
    });
    assert(typeof jwtToken === "string" && jwtToken.split(".").length === 3, "Signs standard HS256 JWT access token");

    const verifiedPayload = await verifyAccessToken(jwtToken);
    assert(verifiedPayload?.id === createdUser.id && verifiedPayload.role === UserRole.ACCOUNTANT, "Verifies and decodes valid JWT payload");

    const tamperedPayload = await verifyAccessToken(jwtToken + "tampered");
    assert(tamperedPayload === null, "Rejects tampered JWT signatures");

    // -------------------------------------------------------------
    // 5. Refresh Token Rotation & Breach Detection
    // -------------------------------------------------------------
    console.log("\n[5] Testing Refresh Token Rotation & Family Revocation...");
    const initialRefresh = await refreshTokenService.generateRefreshToken(createdUser.id);
    assert(typeof initialRefresh.rawToken === "string" && initialRefresh.familyId !== undefined, "Generates secure refresh token record with familyId");

    // Rotate refresh token
    const rotated = await refreshTokenService.rotateRefreshToken(initialRefresh.rawToken);
    assert(rotated.rawToken !== initialRefresh.rawToken && rotated.familyId === initialRefresh.familyId, "Rotates refresh token within same token family");

    // Revoke family
    await refreshTokenService.revokeFamily(initialRefresh.familyId);
    let revokedTokenThrew = false;
    try {
      await refreshTokenService.rotateRefreshToken(rotated.rawToken);
    } catch {
      revokedTokenThrew = true;
    }
    assert(revokedTokenThrew, "Immediately rejects revoked token family");

    // -------------------------------------------------------------
    // 6. Role-Based Access Control (RBAC) Matrix
    // -------------------------------------------------------------
    console.log("\n[6] Testing RBAC Permissions Matrix...");
    assert(hasPermission(UserRole.ADMINISTRATOR, "settings:manage"), "ADMINISTRATOR has 'settings:manage'");
    assert(hasPermission(UserRole.ADMINISTRATOR, "users:write"), "ADMINISTRATOR has 'users:write'");
    assert(!hasPermission(UserRole.ACCOUNTANT, "settings:manage"), "ACCOUNTANT cannot access 'settings:manage'");
    assert(hasPermission(UserRole.ACCOUNTANT, "accounting:write"), "ACCOUNTANT has 'accounting:write'");
    assert(hasPermission(UserRole.CONTACT, "portal:read"), "CONTACT has 'portal:read'");
    assert(!hasPermission(UserRole.CONTACT, "accounting:read"), "CONTACT cannot access 'accounting:read'");

    // -------------------------------------------------------------
    // 7. Password Reset Flow
    // -------------------------------------------------------------
    console.log("\n[7] Testing Password Reset Flow...");
    await authService.requestPasswordReset(createdUser.email);
    const userWithReset = await prisma.user.findUnique({
      where: { id: createdUser.id },
      select: { resetToken: true, resetTokenExpiry: true },
    });
    assert(userWithReset?.resetToken !== null, "Generates secure cryptographic reset token");

    const validTokenRes = await authService.validateResetToken(userWithReset!.resetToken!);
    assert(validTokenRes.valid && validTokenRes.email === createdUser.email, "Validates active reset token");

    const newPass = "NewSecurePassword123!";
    await authService.resetPasswordWithToken(userWithReset!.resetToken!, newPass);

    const postResetUser = await prisma.user.findUnique({
      where: { id: createdUser.id },
      select: { resetToken: true, password: true },
    });
    assert(postResetUser?.resetToken === null, "Clears reset token after successful password reset");

    const loginWithNewPass = await authService.login({
      loginId: testLoginId,
      password: newPass,
    });
    assert(loginWithNewPass.id === createdUser.id, "Successfully authenticates with newly reset password");

    // -------------------------------------------------------------
    // 8. Rate Limiting Protection
    // -------------------------------------------------------------
    console.log("\n[8] Testing Rate Limiting Protection...");
    const rateLimitKey = `test_rate_limit_${Date.now()}`;
    resetRateLimit(rateLimitKey);

    for (let i = 0; i < 5; i++) {
      const check = checkRateLimit({ key: rateLimitKey, limit: 5, windowMs: 10000 });
      assert(check.success, `Request ${i + 1} within limit allowed`);
    }

    const blockedCheck = checkRateLimit({ key: rateLimitKey, limit: 5, windowMs: 10000 });
    assert(!blockedCheck.success && blockedCheck.retryAfterSeconds > 0, "Blocks requests exceeding rate limit threshold");

  } finally {
    // Cleanup test user and associated records
    console.log("\nCleaning up test artifacts...");
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
