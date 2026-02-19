import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from "@/lib/i18n/config";

export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json();
    const resolved = isLocale(String(locale)) ? String(locale) : DEFAULT_LOCALE;

    const response = NextResponse.json({ success: true, locale: resolved });
    response.cookies.set(LOCALE_COOKIE_NAME, resolved, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid locale request" }, { status: 400 });
  }
}
