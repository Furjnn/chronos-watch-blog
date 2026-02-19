import { NextResponse } from "next/server";
import { clearMemberCookie, getMemberSession } from "@/lib/member-auth";

export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    clearMemberCookie(response);
    return response;
  }
  return NextResponse.json({ user: session });
}
