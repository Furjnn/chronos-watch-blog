import MediaClient from "@/components/admin/MediaClient";
import { readdir, stat } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";
import type { ListBlobResult } from "@vercel/blob";

type MediaFile = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
};

async function getBlobFiles(token: string): Promise<MediaFile[]> {
  const files: MediaFile[] = [];
  let cursor: string | undefined = undefined;
  let page = 0;

  while (page < 10) {
    const result: ListBlobResult = await list({
      token,
      prefix: "uploads/",
      limit: 1000,
      ...(cursor ? { cursor } : {}),
    });

    for (const blob of result.blobs) {
      const pathname = blob.pathname || "";
      const filename = pathname.split("/").pop() || pathname;
      if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename)) continue;
      files.push({
        filename,
        url: blob.url,
        size: blob.size,
        createdAt: blob.uploadedAt.toISOString(),
      });
    }

    if (!result.hasMore || !result.cursor) break;
    cursor = result.cursor;
    page += 1;
  }

  return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getLocalFiles(): Promise<MediaFile[]> {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(uploadDir);
    const fileDetails = await Promise.all(
      files
        .filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f))
        .map(async (filename) => {
          const filepath = path.join(uploadDir, filename);
          const stats = await stat(filepath);
          return {
            filename,
            url: `/uploads/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
    );
    return fileDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

async function getUploadedFiles() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      return await getBlobFiles(blobToken);
    } catch {
      // If blob listing fails, fall back to local files in development.
      if (process.env.VERCEL === "1") return [];
    }
  }

  return getLocalFiles();
}

export default async function MediaPage() {
  const files = await getUploadedFiles();
  return <MediaClient files={files} />;
}
