import { NextResponse } from "next/server";
import { clearMemberCookie } from "@/lib/member-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearMemberCookie(response);
  return response;
}
