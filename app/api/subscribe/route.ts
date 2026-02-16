// ═══ src/app/api/subscribe/route.ts ═══
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Mailchimp integration
    // Gerçek projede burayı Mailchimp API key'inle doldur
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const MAILCHIMP_DC = MAILCHIMP_API_KEY?.split("-").pop(); // datacenter

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
      // Development mode: sadece log'la
      console.log(`[Newsletter] New subscriber: ${email}`);
      return NextResponse.json({ success: true, message: "Subscribed (dev mode)" });
    }

    const response = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "pending", // Double opt-in
        }),
      }
    );

    if (response.status === 400) {
      const data = await response.json();
      if (data.title === "Member Exists") {
        return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
      }
    }

    if (!response.ok) {
      throw new Error("Mailchimp API error");
    }

    return NextResponse.json({ success: true, message: "Check your email to confirm" });
  } catch (err) {
    console.error("[Newsletter Error]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
