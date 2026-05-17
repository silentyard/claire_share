import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Paths that don't require authentication
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/_next/",
  "/favicon",
  "/stickers/",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = await verifyToken(token);

  if (!user) {
    // Invalid / tampered token — clear cookie and redirect
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Inject user identity as a request header for server components / API routes
  const res = NextResponse.next();
  res.headers.set("x-user", user);
  return res;
}

export const config = {
  // Run on all routes except Next.js static assets and image optimisation
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
