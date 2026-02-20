import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { MemberAuthError, requireMemberSession } from "@/lib/member-auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await requireMemberSession();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF, SVG" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 8MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    const filename = `${timestamp}-${session.id.slice(0, 6)}-${safeName}.${ext}`;

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
      });

      return NextResponse.json({
        url: blob.url,
        filename,
        size: file.size,
        type: file.type,
      });
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        { error: "Upload storage is not configured. Set BLOB_READ_WRITE_TOKEN for production uploads." },
        { status: 500 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = error instanceof MemberAuthError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
