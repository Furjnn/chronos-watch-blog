import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isLocale, LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n/config";
import { getLocaleFromPathname, getPreferredLocale, localizePathname, stripLocaleFromPathname } from "@/lib/i18n/routing";

const EXCLUDED_EXACT_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/rss.xml",
]);

const EXCLUDED_PREFIXES = ["/_next", "/api", "/admin", "/studio", "/og"];
const FILE_EXTENSION_REGEX = /\.[^/]+$/;
const ADMIN_PATH_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminPath(pathname: string) {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

function isAdminPublicPath(pathname: string) {
  return pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
}

async function hasValidAdminToken(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;
  if (!token) return false;

  const secret = (process.env.AUTH_SECRET || "").trim();
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

function redirectToAdminLogin(request: NextRequest, nextPath: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = ADMIN_LOGIN_PATH;
  redirectUrl.search = "";
  if (nextPath && nextPath !== ADMIN_PATH_PREFIX) {
    redirectUrl.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(redirectUrl);
}

function isExcludedPath(pathname: string) {
  if (EXCLUDED_EXACT_PATHS.has(pathname)) return true;
  if (FILE_EXTENSION_REGEX.test(pathname)) return true;
  return EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function resolveRequestLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return getPreferredLocale(request.headers.get("accept-language"));
}

function buildCookieHeaderWithLocale(existingCookieHeader: string | null, locale: Locale) {
  const localeCookie = `${LOCALE_COOKIE_NAME}=${locale}`;
  if (!existingCookieHeader) return localeCookie;

  const cookies = existingCookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((cookie) => !cookie.startsWith(`${LOCALE_COOKIE_NAME}=`));

  cookies.unshift(localeCookie);
  return cookies.join("; ");
}

function withLocaleHeaders(request: NextRequest, locale: Locale, pathnameWithoutLocale: string) {
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  headers.set("x-pathname", pathnameWithoutLocale);
  headers.set("cookie", buildCookieHeaderWithLocale(request.headers.get("cookie"), locale));
  return headers;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeFromPath = getLocaleFromPathname(pathname);
  const pathnameWithoutLocale = localeFromPath ? stripLocaleFromPathname(pathname) : pathname;

  if (isAdminPath(pathnameWithoutLocale)) {
    if (localeFromPath) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathnameWithoutLocale;
      return NextResponse.redirect(redirectUrl);
    }

    const authenticated = await hasValidAdminToken(request);
    const publicAdminPath = isAdminPublicPath(pathnameWithoutLocale);

    if (!authenticated && !publicAdminPath) {
      const nextPath = `${pathnameWithoutLocale}${request.nextUrl.search || ""}`;
      return redirectToAdminLogin(request, nextPath);
    }

    if (authenticated && publicAdminPath) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ADMIN_PATH_PREFIX;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  if (localeFromPath) {
    if (isExcludedPath(pathnameWithoutLocale)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathnameWithoutLocale;
      return NextResponse.redirect(redirectUrl);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathnameWithoutLocale;

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: withLocaleHeaders(request, localeFromPath, pathnameWithoutLocale) },
    });

    if (request.cookies.get(LOCALE_COOKIE_NAME)?.value !== localeFromPath) {
      response.cookies.set(LOCALE_COOKIE_NAME, localeFromPath, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }

    return response;
  }

  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  const locale = resolveRequestLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = localizePathname(pathname, locale);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
