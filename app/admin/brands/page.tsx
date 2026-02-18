import { prisma } from "@/lib/prisma";
import BrandsListClient from "@/components/admin/BrandsListClient";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true, reviews: true } } } });
  return <BrandsListClient brands={brands.map(b => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))} />;
}
