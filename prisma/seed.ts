// prisma/seed.ts
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set both before running seed.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  const authors = [
    { name: "James Chen", slug: "james-chen", role: "Senior Watch Editor", bio: "15 years covering the watch industry. Specializes in dive watches." },
    { name: "Sofia Laurent", slug: "sofia-laurent", role: "Buying Guide Editor", bio: "Former luxury retail consultant. Investment watch expert." },
    { name: "Emilia Hartwell", slug: "emilia-hartwell", role: "Culture & Heritage Writer", bio: "Historian focused on the cultural significance of watchmaking." },
    { name: "Luca Moretti", slug: "luca-moretti", role: "Technical Editor", bio: "Trained watchmaker turned writer. Movement specialist." },
  ];
  for (const author of authors) {
    await prisma.author.upsert({ where: { slug: author.slug }, update: {}, create: author });
  }

  const categories = [
    { name: "Review", slug: "review", icon: "star" },
    { name: "Guide", slug: "guide", icon: "guide" },
    { name: "Heritage", slug: "heritage", icon: "heritage" },
    { name: "Technical", slug: "technical", icon: "technical" },
    { name: "Vintage", slug: "vintage", icon: "vintage" },
    { name: "Interview", slug: "interview", icon: "interview" },
    { name: "Culture", slug: "culture", icon: "culture" },
    { name: "News", slug: "news", icon: "news" },
  ];
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
  }

  const tagNames = ["Chronograph", "Dive Watch", "Dress Watch", "Tourbillon", "GMT", "Moonphase", "Automatic", "Manual Wind", "Pilot Watch", "Field Watch"];
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

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
  for (const brand of brands) {
    await prisma.brand.upsert({ where: { slug: brand.slug }, update: {}, create: brand });
  }

  const james = await prisma.author.findUniqueOrThrow({ where: { slug: "james-chen" } });
  const sofia = await prisma.author.findUniqueOrThrow({ where: { slug: "sofia-laurent" } });
  const emilia = await prisma.author.findUniqueOrThrow({ where: { slug: "emilia-hartwell" } });
  const luca = await prisma.author.findUniqueOrThrow({ where: { slug: "luca-moretti" } });
  const reviewCat = await prisma.category.findUniqueOrThrow({ where: { slug: "review" } });
  const guideCat = await prisma.category.findUniqueOrThrow({ where: { slug: "guide" } });
  const heritageCat = await prisma.category.findUniqueOrThrow({ where: { slug: "heritage" } });
  const techCat = await prisma.category.findUniqueOrThrow({ where: { slug: "technical" } });
  const rolex = await prisma.brand.findUniqueOrThrow({ where: { slug: "rolex" } });
  const tudor = await prisma.brand.findUniqueOrThrow({ where: { slug: "tudor" } });

  const posts = [
    { title: "The New Submariner: A Deep Dive", slug: "new-submariner", excerpt: "An in-depth look at the latest iteration of the iconic diving watch.", authorId: james.id, catId: reviewCat.id, brandId: rolex.id, featured: true, readingTime: 8 },
    { title: "Investment Pieces: What to Buy in 2026", slug: "investment-pieces", excerpt: "Expert insights on which timepieces are likely to appreciate in value.", authorId: sofia.id, catId: guideCat.id, brandId: null, featured: true, readingTime: 12 },
    { title: "Swiss Craftsmanship Through the Ages", slug: "swiss-craftsmanship", excerpt: "Exploring centuries-old traditions that make Swiss watchmaking the gold standard.", authorId: emilia.id, catId: heritageCat.id, brandId: null, featured: true, readingTime: 10 },
    { title: "Understanding Complications", slug: "understanding-complications", excerpt: "A guide to the complex mechanisms that elevate a watch from good to exceptional.", authorId: luca.id, catId: techCat.id, brandId: null, featured: false, readingTime: 15 },
    { title: "Tudor Black Bay 58: The Value Champion", slug: "tudor-black-bay", excerpt: "Tudor's flagship diver delivers a compelling package.", authorId: luca.id, catId: reviewCat.id, brandId: tudor.id, featured: false, readingTime: 10 },
  ];

  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i];
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: `${post.excerpt} This article explores the topic in detail.` }] }] },
        status: "PUBLISHED",
        featured: post.featured,
        readingTime: post.readingTime,
        publishedAt: new Date(2026, 1, 14 - i * 2),
        authorId: post.authorId,
        brandId: post.brandId,
        categories: { connect: { id: post.catId } },
      },
    });
  }

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
      authorId: james.id,
      brandId: rolex.id,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", siteName: "Chronos" },
  });

  console.log(`Seed complete. Login email: ${adminEmail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
