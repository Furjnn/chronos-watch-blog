// prisma/seed.ts
// Çalıştırmak için: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin User ──
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@chronos.blog" },
    update: {},
    create: {
      email: "admin@chronos.blog",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created (admin@chronos.blog / admin123)");

  // ── Authors ──
  const authors = [
    { name: "James Chen", slug: "james-chen", role: "Senior Watch Editor", bio: "15 years covering the watch industry. Specializes in dive watches." },
    { name: "Sofia Laurent", slug: "sofia-laurent", role: "Buying Guide Editor", bio: "Former luxury retail consultant. Investment watch expert." },
    { name: "Emilia Hartwell", slug: "emilia-hartwell", role: "Culture & Heritage Writer", bio: "Historian focused on the cultural significance of watchmaking." },
    { name: "Luca Moretti", slug: "luca-moretti", role: "Technical Editor", bio: "Trained watchmaker turned writer. Movement specialist." },
  ];
  for (const a of authors) {
    await prisma.author.upsert({ where: { slug: a.slug }, update: {}, create: a });
  }
  console.log(`✅ ${authors.length} authors created`);

  // ── Categories ──
  const categories = [
    { name: "Review", slug: "review", icon: "★" },
    { name: "Guide", slug: "guide", icon: "▸" },
    { name: "Heritage", slug: "heritage", icon: "◎" },
    { name: "Technical", slug: "technical", icon: "⚙" },
    { name: "Vintage", slug: "vintage", icon: "◉" },
    { name: "Interview", slug: "interview", icon: "◇" },
    { name: "Culture", slug: "culture", icon: "◆" },
    { name: "News", slug: "news", icon: "◆" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log(`✅ ${categories.length} categories created`);

  // ── Tags ──
  const tagNames = ["Chronograph", "Dive Watch", "Dress Watch", "Tourbillon", "GMT", "Moonphase", "Automatic", "Manual Wind", "Pilot Watch", "Field Watch"];
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  console.log(`✅ ${tagNames.length} tags created`);

  // ── Brands ──
  const brands = [
    { name: "Rolex", slug: "rolex", country: "Switzerland", founded: 1905, priceSegment: "LUXURY" as const },
    { name: "Omega", slug: "omega", country: "Switzerland", founded: 1848, priceSegment: "LUXURY" as const },
    { name: "Patek Philippe", slug: "patek-philippe", country: "Switzerland", founded: 1839, priceSegment: "ULTRA_LUXURY" as const },
    { name: "Tudor", slug: "tudor", country: "Switzerland", founded: 1926, priceSegment: "MID_RANGE" as const },
    { name: "Cartier", slug: "cartier", country: "France", founded: 1847, priceSegment: "LUXURY" as const },
    { name: "Audemars Piguet", slug: "audemars-piguet", country: "Switzerland", founded: 1875, priceSegment: "ULTRA_LUXURY" as const },
    { name: "Grand Seiko", slug: "grand-seiko", country: "Japan", founded: 1960, priceSegment: "LUXURY" as const },
    { name: "IWC", slug: "iwc", country: "Switzerland", founded: 1868, priceSegment: "LUXURY" as const },
    { name: "Seiko", slug: "seiko", country: "Japan", founded: 1881, priceSegment: "ENTRY" as const },
  ];
  for (const b of brands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }
  console.log(`✅ ${brands.length} brands created`);

  // ── Posts ──
  const james = await prisma.author.findUnique({ where: { slug: "james-chen" } });
  const sofia = await prisma.author.findUnique({ where: { slug: "sofia-laurent" } });
  const emilia = await prisma.author.findUnique({ where: { slug: "emilia-hartwell" } });
  const luca = await prisma.author.findUnique({ where: { slug: "luca-moretti" } });
  const reviewCat = await prisma.category.findUnique({ where: { slug: "review" } });
  const guideCat = await prisma.category.findUnique({ where: { slug: "guide" } });
  const heritageCat = await prisma.category.findUnique({ where: { slug: "heritage" } });
  const techCat = await prisma.category.findUnique({ where: { slug: "technical" } });
  const rolex = await prisma.brand.findUnique({ where: { slug: "rolex" } });
  const tudor = await prisma.brand.findUnique({ where: { slug: "tudor" } });

  const posts = [
    { title: "The New Submariner: A Deep Dive", slug: "new-submariner", excerpt: "An in-depth look at the latest iteration of the iconic diving watch.", authorId: james!.id, catId: reviewCat!.id, brandId: rolex!.id, featured: true, readingTime: 8 },
    { title: "Investment Pieces: What to Buy in 2026", slug: "investment-pieces", excerpt: "Expert insights on which timepieces are likely to appreciate in value.", authorId: sofia!.id, catId: guideCat!.id, brandId: null, featured: true, readingTime: 12 },
    { title: "Swiss Craftsmanship Through the Ages", slug: "swiss-craftsmanship", excerpt: "Exploring centuries-old traditions that make Swiss watchmaking the gold standard.", authorId: emilia!.id, catId: heritageCat!.id, brandId: null, featured: true, readingTime: 10 },
    { title: "Understanding Complications", slug: "understanding-complications", excerpt: "A guide to the complex mechanisms that elevate a watch from good to exceptional.", authorId: luca!.id, catId: techCat!.id, brandId: null, featured: false, readingTime: 15 },
    { title: "Tudor Black Bay 58: The Value Champion", slug: "tudor-black-bay", excerpt: "Tudor's flagship diver delivers a compelling package.", authorId: luca!.id, catId: reviewCat!.id, brandId: tudor!.id, featured: false, readingTime: 10 },
  ];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: p.excerpt + " This article explores the topic in detail." }] }] },
        status: "PUBLISHED",
        featured: p.featured,
        readingTime: p.readingTime,
        publishedAt: new Date(2026, 1, 14 - i * 2),
        authorId: p.authorId,
        brandId: p.brandId,
        categories: { connect: { id: p.catId } },
      },
    });
  }
  console.log(`✅ ${posts.length} posts created`);

  // ── Review ──
  await prisma.review.upsert({
    where: { slug: "rolex-submariner" },
    update: {},
    create: {
      title: "Rolex Submariner 126610LN",
      slug: "rolex-submariner",
      watchRef: "126610LN",
      rating: 9.2,
      verdict: "The Submariner remains the benchmark by which all dive watches are measured.",
      specs: { caseSize: "41mm", caseMaterial: "Oystersteel (904L)", waterResistance: "300m", movement: "Calibre 3235", powerReserve: "70 hours", frequency: "28,800 vph" },
      prosAndCons: { pros: ["Exceptional build quality", "70-hour power reserve", "Glidelock clasp"], cons: ["Hard to get at retail", "Cyclops is polarizing"] },
      priceMin: 10250,
      priceMax: 14800,
      status: "PUBLISHED",
      publishedAt: new Date(2026, 1, 10),
      authorId: james!.id,
      brandId: rolex!.id,
    },
  });
  console.log("✅ 1 review created");

  // ── Site Settings ──
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", siteName: "Chronos" },
  });
  console.log("✅ Site settings created");

  console.log("\n🎉 Seed complete! Login with: admin@chronos.blog / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
