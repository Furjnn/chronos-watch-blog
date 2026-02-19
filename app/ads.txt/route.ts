import { NextResponse } from "next/server";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";

export function GET() {
  const explicitPublisherId = (process.env.ADSENSE_PUBLISHER_ID || "").trim();
  const publisherFromClient = ADSENSE_CLIENT_ID.startsWith("ca-pub-")
    ? ADSENSE_CLIENT_ID.replace(/^ca-/, "")
    : "";
  const publisherId = explicitPublisherId || publisherFromClient;

  if (!publisherId) {
    return new NextResponse("", {
      status: 204,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
