import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Sanity seed endpoint is disabled. Use Prisma seed instead: npx tsx prisma/seed.ts",
    },
    { status: 410 },
  );
}
