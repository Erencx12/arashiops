import { NextRequest, NextResponse } from "next/server";
import { decrypt, COOKIE_NAME } from "@/lib/session";

const OWNER_ROUTES = ["/admin", "/metrics"];
const CLIENT_ROUTES = ["/client"];
const PROTECTED_PREFIXES = [...OWNER_ROUTES, ...CLIENT_ROUTES];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isOwnerRoute(pathname: string) {
  return OWNER_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isClientRoute(pathname: string) {
  return CLIENT_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth pages: redirect already-logged-in users to their dashboard
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthPage || pathname.startsWith("/api/setup")) {
    if (isAuthPage) {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      const session = await decrypt(token);
      if (session?.userId) {
        return NextResponse.redirect(
          new URL(session.role === "owner" ? "/admin" : "/client", req.nextUrl)
        );
      }
    }
    return NextResponse.next();
  }

  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await decrypt(token);

  // Not authenticated → login
  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Client trying to access owner-only routes
  if (session.role === "client" && isOwnerRoute(pathname)) {
    return NextResponse.redirect(new URL("/client", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.svg|.*\\.png$|.*\\.ico$).*)"],
};
