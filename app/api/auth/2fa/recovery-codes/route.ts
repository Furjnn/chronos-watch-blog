import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateAdminRecoveryCodes, getAdminRecoveryCodeInfo } from "@/lib/admin-recovery";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireAuth(["ADMIN"]);
    const info = await getAdminRecoveryCodeInfo(session.id);
    return NextResponse.json(info);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unauthorized") },
      { status: getErrorStatus(error, 401) },
    );
  }
}

export async function POST() {
  try {
    const session = await requireAuth(["ADMIN"]);
    const generated = await generateAdminRecoveryCodes(session.id);
    if (!generated.ok) {
      return NextResponse.json({ error: generated.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      codes: generated.codes,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unable to generate recovery codes") },
      { status: getErrorStatus(error, 500) },
    );
  }
}
