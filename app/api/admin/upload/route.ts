import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF, SVG" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 50);
    const filename = `${timestamp}-${safeName}.${ext}`;

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

    // Vercel serverless filesystem is read-only; require Blob in production.
    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        { error: "Upload storage is not configured. Set BLOB_READ_WRITE_TOKEN for production uploads." },
        { status: 500 },
      );
    }

    // Local/dev fallback: write to /public/uploads.
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 500
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
