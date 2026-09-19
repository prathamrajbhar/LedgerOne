import { prisma } from "../lib/prisma";
import { authService } from "../lib/services/auth.service";
import { passwordService } from "../lib/services/auth/password.service";
import { refreshTokenService } from "../lib/services/refresh-token.service";
import { emailService } from "../lib/email/client";
import { signAccessToken, verifyAccessToken } from "../lib/auth/token";
import { hasPermission } from "../lib/auth/permissions";
import { checkRateLimit, resetRateLimit } from "../lib/auth/rate-limit";
import { UserRole, ContactType } from "@prisma/client";

async function runYopmailE2ETestSuite() {
  console.log("================================================================");
  console.log("   LEDGERONE END-TO-END AUTHENTICATION WITH YOPMAIL SUITE       ");
  console.log("================================================================");

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

  const timestamp = Date.now().toString().slice(-6);
  const accountantLoginId = `acct_${timestamp}`;
  const accountantEmail = `ledgerone.acct.${timestamp}@yopmail.com`;
  const accountantPassword = "AcctPassword123!";

  const adminLoginId = `admin_${timestamp}`;
  const adminEmail = `ledgerone.admin.${timestamp}@yopmail.com`;
  const adminPassword = "AdminPassword123!";

  const contactEmail = `ledgerone.client.${timestamp}@yopmail.com`;

  try {
    // -------------------------------------------------------------
    // 1. Accountant Registration with YOPmail & Welcome Email
    // -------------------------------------------------------------
    console.log("\n[1] Registering Accountant with YOPmail inbox...");
    const acctUser = await authService.signUp({
      loginId: accountantLoginId,
      email: accountantEmail,
      name: "Yopmail Accountant",
      password: accountantPassword,
      role: UserRole.ACCOUNTANT,
    });
    assert(acctUser.email === accountantEmail, `Accountant registered with ${accountantEmail}`);

    const welcomeEmailResult = await emailService.sendWelcomeEmail(
      accountantEmail,
      "Yopmail Accountant",
      "Accountant"
    );
    assert(welcomeEmailResult.messageId !== undefined, `Welcome email successfully dispatched to ${accountantEmail}`);

    // -------------------------------------------------------------
    // 2. Administrator Creation & Contact Portal Invitation
    // -------------------------------------------------------------
    console.log("\n[2] Creating Administrator & Inviting Contact to Portal with YOPmail...");
    const hashedPassword = await passwordService.hash(adminPassword);
    const adminUser = await prisma.user.create({
      data: {
        loginId: adminLoginId,
        email: adminEmail,
        password: hashedPassword,
        name: "Yopmail Admin",
        role: UserRole.ADMINISTRATOR,
      },
    });
    assert(adminUser.role === UserRole.ADMINISTRATOR, `Administrator created with ${adminEmail}`);

    // Create a Contact with YOPmail
    const contact = await prisma.contact.create({
      data: {
        name: "Luxury Living YOP",
        type: ContactType.CUSTOMER,
        email: contactEmail,
        phone: "+91 9876543210",
        city: "Mumbai",
        state: "Maharashtra",
      },
    });
    assert(contact.email === contactEmail, `Contact created with ${contactEmail}`);

    // Invite Contact to Portal
    const inviteResult = await authService.inviteContactToPortal({
      contactId: contact.id,
      invitedByUserId: adminUser.id,
    });
    assert(inviteResult.userId !== undefined, "Portal invitation generated credentials");
    assert(inviteResult.loginId.startsWith("cust"), `Assigned sequential login ID: ${inviteResult.loginId}`);
    assert(inviteResult.temporaryPassword.length >= 8, "Generated temporary password with complexity");

    // Contact logs in with temporary password
    const portalLogin = await authService.login({
      loginId: inviteResult.loginId,
      password: inviteResult.temporaryPassword,
    });
    assert(portalLogin.mustChangePassword === true, "New portal contact flagged with mustChangePassword=true");
    assert(portalLogin.role === UserRole.CONTACT, "Contact role successfully applied");

    // Contact updates temporary password to permanent password
    const permanentContactPassword = "PermContactPass123!";
    const updatePassRes = await authService.updateTemporaryPassword(
      portalLogin.id,
      permanentContactPassword
    );
    assert(updatePassRes.success === true, "Contact updated temporary password to permanent password");

    const permanentLogin = await authService.login({
      loginId: contactEmail,
      password: permanentContactPassword,
    });
    assert(permanentLogin.mustChangePassword === false, "mustChangePassword cleared on permanent password update");

    // -------------------------------------------------------------
    // 3. Password Reset Workflow via YOPmail
    // -------------------------------------------------------------
    console.log("\n[3] Testing Password Reset Flow via YOPmail...");
    const resetReq = await authService.requestPasswordReset(accountantEmail);
    assert(resetReq.success === true, `Password reset requested for ${accountantEmail}`);

    const userRecord = await prisma.user.findUnique({
      where: { id: acctUser.id },
      select: { resetToken: true },
    });
    assert(typeof userRecord?.resetToken === "string", "Cryptographic reset token generated and stored");

    const tokenValidation = await authService.validateResetToken(userRecord!.resetToken!);
    assert(tokenValidation.valid === true && tokenValidation.email === accountantEmail, "Token verified successfully");

    const newAcctPassword = "NewAcctPassword123!";
    const resetExec = await authService.resetPasswordWithToken(userRecord!.resetToken!, newAcctPassword);
    assert(resetExec.success === true, "Password reset with token succeeded");

    const newLogin = await authService.login({
      loginId: accountantLoginId,
      password: newAcctPassword,
    });
    assert(newLogin.id === acctUser.id, "Successfully authenticated with new password");

    // -------------------------------------------------------------
    // 4. Session JWTs, Refresh Tokens & RBAC Verification
    // -------------------------------------------------------------
    console.log("\n[4] Testing JWT Tokens, Refresh Rotation, and RBAC...");
    const accessToken = await signAccessToken({
      id: acctUser.id,
      email: accountantEmail,
      loginId: accountantLoginId,
      name: acctUser.name,
      role: UserRole.ACCOUNTANT,
    });
    const verifiedToken = await verifyAccessToken(accessToken);
    assert(verifiedToken?.email === accountantEmail, "JWT access token contains valid YOPmail claims");

    const refreshTokenRecord = await refreshTokenService.generateRefreshToken(acctUser.id);
    const rotatedToken = await refreshTokenService.rotateRefreshToken(refreshTokenRecord.rawToken);
    assert(rotatedToken.rawToken !== refreshTokenRecord.rawToken, "Refresh token rotated successfully");

    // RBAC validation across roles
    assert(hasPermission(UserRole.ADMINISTRATOR, "settings:manage"), "Admin can manage settings");
    assert(!hasPermission(UserRole.ACCOUNTANT, "settings:manage"), "Accountant cannot manage settings");
    assert(hasPermission(UserRole.ACCOUNTANT, "accounting:read"), "Accountant can read accounting");
    assert(hasPermission(UserRole.CONTACT, "portal:read"), "Contact can read portal");
    assert(!hasPermission(UserRole.CONTACT, "accounting:read"), "Contact blocked from internal accounting");

    // -------------------------------------------------------------
    // 5. Rate Limiting Protection
    // -------------------------------------------------------------
    console.log("\n[5] Testing Rate Limiter on YOPmail address...");
    const rateLimitKey = `yopmail_limit:${accountantEmail}`;
    resetRateLimit(rateLimitKey);

    for (let i = 0; i < 3; i++) {
      const allowed = checkRateLimit({ key: rateLimitKey, limit: 3, windowMs: 5000 });
      assert(allowed.success, `Attempt ${i + 1} within threshold permitted`);
    }
    const blocked = checkRateLimit({ key: rateLimitKey, limit: 3, windowMs: 5000 });
    assert(!blocked.success && blocked.retryAfterSeconds > 0, "Excessive attempts blocked by rate limiter");

  } finally {
    // Clean up test data
    console.log("\nCleaning up YOPmail test accounts...");
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            in: [accountantEmail, adminEmail, contactEmail],
          },
        },
      },
    });
    await prisma.contact.deleteMany({
      where: { email: contactEmail },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [accountantEmail, adminEmail, contactEmail],
        },
      },
    });
  }

  console.log("\n================================================================");
  console.log(`YOPMAIL E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runYopmailE2ETestSuite().catch((err) => {
  console.error("YOPmail E2E Test execution failed:", err);
  process.exit(1);
});
