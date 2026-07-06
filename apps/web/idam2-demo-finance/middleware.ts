import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidSessionUserId, SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionUserId = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = isValidSessionUserId(sessionUserId);

  if (
    (pathname.startsWith("/home") || pathname.startsWith("/vendors")) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/vendors", "/vendors/:path*", "/login"],
};
