import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isSecure = request.nextUrl.protocol === "https:";

  // Check Auth.js v5 cookie first, then fallback to next-auth cookie
  const mainCookie = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const legacyCookie = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";

  let token = await getToken({
    req: request,
    secret,
    secureCookie: isSecure,
    cookieName: mainCookie,
    salt: mainCookie,
  });

  if (!token) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: isSecure,
      cookieName: legacyCookie,
      salt: legacyCookie,
    });
  }

  // Handle root route cleanly without false session expired errors
  if (pathname === "/") {
    if (token) {
      const dest = token.role === "CONTACT" ? "/portal/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Public routes that don't need authentication
  const publicRoutes = ["/login", "/portal/login", "/sign-up", "/signup", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    if (token && (pathname === "/login" || pathname === "/portal/login")) {
      const dest = token.role === "CONTACT" ? "/portal/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Redirect to appropriate login if not authenticated or session invalidated
  if (!token) {
    const isPortalRoute = pathname.startsWith("/portal");
    const loginUrl = isPortalRoute ? "/portal/login" : "/login";
    const url = new URL(loginUrl, request.url);

    const hasSessionCookie =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token") ||
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token");

    const response = NextResponse.redirect(url);

    if (hasSessionCookie) {
      url.searchParams.set("error", "SessionExpired");
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
    }

    return response;
  }

  const userRole = token.role as string | undefined;

  // Workspace routes - only ADMINISTRATOR and ACCOUNTANT
  const workspaceRoutes = [
    "/workspace",
    "/dashboard",
    "/contacts",
    "/products",
    "/accounts",
    "/journals",
    "/journal-entries",
    "/payments",
    "/analytic-accounts",
    "/sales",
    "/purchases",
    "/purchase",
    "/bills",
    "/invoices",
    "/inventory",
    "/expenses",
    "/financial-reports",
    "/tax-rates",
    "/transactions",
    "/users",
    "/budgets",
    "/reports",
    "/settings",
  ];

  const isWorkspaceRoute = workspaceRoutes.some((route) => pathname.startsWith(route));

  if (isWorkspaceRoute) {
    // CONTACT users should go to portal
    if (userRole === "CONTACT") {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }

    // ADMINISTRATOR-only routes per docs/rbac.md
    if (pathname.startsWith("/settings") && userRole !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Portal routes - only CONTACT
  if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/login")) {
    if (userRole !== "CONTACT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
