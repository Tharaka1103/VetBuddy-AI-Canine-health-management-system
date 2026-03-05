import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, redirectToLogin } from "@/lib/auth";

/**
 * Edge-compatible middleware — protects /dashboard and /admin routes.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — allow through
  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  // Not authenticated → redirect to login
  if (!session) {
    return redirectToLogin(req);
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/canines/:path*", "/api/health/:path*", "/api/notifications/:path*"],
};
