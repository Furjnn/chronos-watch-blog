import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_LOGIN_PATH = "/admin/login";

function isPublicAdminPath(pathname: string) {
  return pathname === ADMIN_LOGIN_PATH;
}

async function hasValidSessionToken(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get("admin-token")?.value;
  const validToken = token ? await hasValidSessionToken(token) : false;

  if (!validToken && !isPublicAdminPath(pathname)) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (validToken && isPublicAdminPath(pathname)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
