import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/portal/login",
  "/sign-up",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const WORKSPACE_ROUTES = [
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isSecure = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  let token = await getToken({
    req: request,
    secret,
    secureCookie: isSecure,
  });

  if (!token && isSecure) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: false,
    });
  }

  // Handle Root URL
  if (pathname === "/") {
    if (token) {
      const destination = token.role === "CONTACT" ? "/portal/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle Public Auth Routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    if (token && (pathname === "/login" || pathname === "/portal/login")) {
      const destination = token.role === "CONTACT" ? "/portal/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Handle Unauthenticated Protected Access
  if (!token) {
    const isPortalRoute = pathname.startsWith("/portal");
    const loginPath = isPortalRoute ? "/portal/login" : "/login";
    const redirectUrl = new URL(loginPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const userRole = token.role as string | undefined;

  // Workspace Routes RBAC
  const isWorkspaceRoute = WORKSPACE_ROUTES.some((route) => pathname.startsWith(route));
  if (isWorkspaceRoute) {
    if (userRole === "CONTACT") {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }

    // Administrator-only restricted routes
    if ((pathname.startsWith("/settings") || pathname.startsWith("/users")) && userRole !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Portal Routes RBAC
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
