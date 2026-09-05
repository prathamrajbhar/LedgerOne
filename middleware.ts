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

  // Workspace routes - only ADMINISTRATOR and ACCOUNTANT
  const workspaceRoutes = [
    "/workspace",
    "/dashboard",
    "/users",
    "/contacts",
    "/products",
    "/accounts",
    "/journals",
    "/journal-entries",
    "/payments",
    "/analytic-accounts",
    "/sales",
    "/purchase",
    "/budgets",
    "/reports",
    "/settings"
  ];

  const isWorkspaceRoute = workspaceRoutes.some((route) => pathname.startsWith(route));

  if (isWorkspaceRoute) {
    // CONTACT users should go to portal
    if (userRole === "CONTACT") {
      return NextResponse.redirect(new URL("/portal/home", request.url));
    }

    // ADMINISTRATOR-only routes per docs/rbac.md:
    // - User Management (/users/*)
    // - Product Categories (/products/categories)
    // - System Settings (/settings)
    const administratorOnlyRoutes = [
      "/users",                    // User Management section
      "/products/categories",       // Product Categories (ACCOUNTANT cannot see)
      "/settings"                  // System Settings
    ];

    const isAdministratorOnly = administratorOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdministratorOnly && userRole !== "ADMINISTRATOR") {
      // ACCOUNTANT trying to access ADMINISTRATOR-only routes
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Portal routes - only CONTACT
  if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/login")) {
    if (userRole !== "CONTACT") {
      // ADMINISTRATOR and ACCOUNTANT should go to workspace
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
