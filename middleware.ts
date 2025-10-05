// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const protectedPaths = ["/statusadmin-cass"];

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login-amin", request.url));
    }

    try {
      jwt.verify(token, "MY_SECRET");
    } catch (err) {
      return NextResponse.redirect(new URL("/login-amin", request.url));
    }
  }

    if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login-amin", request.url));
    }

  if (pathname === "/login-amin" && token) {
    return NextResponse.redirect(new URL("/statusadmin-cass/Home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/statusadmin-cass/:path*", "/login-amin"],
};
