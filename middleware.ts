import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ["/login", "/portal/login", "/sign-up", "/signup", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    if (pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = token.role as string | undefined;

  // Workspace routes - only Admin and Accountant
  if (
    pathname.startsWith("/workspace") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/bills") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/journals") ||
    pathname.startsWith("/journal-entries") ||
    pathname.startsWith("/budgets") ||
    pathname.startsWith("/analytic-accounts") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings")
  ) {
    if (userRole === "CONTACT") {
      // Contacts should go to portal
      return NextResponse.redirect(new URL("/portal/home", request.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/settings/users") && userRole !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/settings") && userRole !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Portal routes - only Contact
  if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/login")) {
    if (userRole !== "CONTACT") {
      // Admin and Accountant should go to workspace
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
