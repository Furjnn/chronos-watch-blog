import { prisma } from "@/lib/prisma";
import MediaClient from "@/components/admin/MediaClient";
import { readdir, stat } from "fs/promises";
import path from "path";

async function getUploadedFiles() {
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

export default async function MediaPage() {
  const files = await getUploadedFiles();
  return <MediaClient files={files} />;
}
