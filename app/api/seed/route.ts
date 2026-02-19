// app/api/seed/route.ts
// Sanity'ye demo içerik ekleyen API endpoint
// Kullanım: http://localhost:3000/api/seed çalıştır (sadece 1 kere)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Seed endpoint is disabled in production" }, { status: 403 });
    }

    const seedSecret = process.env.SEED_SECRET;
    if (seedSecret) {
      const incoming = req.nextUrl.searchParams.get("secret");
      if (incoming !== seedSecret) {
        return NextResponse.json({ error: "Invalid seed secret" }, { status: 401 });
      }
    }

    const { writeClient } = await import("@/sanity/client");

    // ── Check if already seeded ──
    const existing = await writeClient.fetch(`count(*[_type == "post"])`);
    if (existing > 0) {
      return NextResponse.json({ message: "Already seeded. Delete existing content first.", count: existing });
    }

    // ── 1. Authors ──
    const authors = [
      { _type: "author", _id: "author-james", name: "James Chen", slug: { _type: "slug", current: "james-chen" }, role: "Senior Watch Editor", bio: "15 years covering the watch industry. Specializes in dive watches and tool watches." },
      { _type: "author", _id: "author-sofia", name: "Sofia Laurent", slug: { _type: "slug", current: "sofia-laurent" }, role: "Buying Guide Editor", bio: "Former luxury retail consultant. Expert in value-driven collecting and investment pieces." },
      { _type: "author", _id: "author-emilia", name: "Emilia Hartwell", slug: { _type: "slug", current: "emilia-hartwell" }, role: "Culture & Heritage Writer", bio: "Historian focused on the cultural significance of watchmaking traditions." },
      { _type: "author", _id: "author-luca", name: "Luca Moretti", slug: { _type: "slug", current: "luca-moretti" }, role: "Technical Editor", bio: "Trained watchmaker turned writer. Breaks down complex movements into accessible content." },
    ];

    // ── 2. Categories ──
    const categories = [
      { _type: "category", _id: "cat-review", name: "Review", slug: { _type: "slug", current: "review" }, icon: "★" },
      { _type: "category", _id: "cat-guide", name: "Guide", slug: { _type: "slug", current: "guide" }, icon: "▸" },
      { _type: "category", _id: "cat-heritage", name: "Heritage", slug: { _type: "slug", current: "heritage" }, icon: "◎" },
      { _type: "category", _id: "cat-technical", name: "Technical", slug: { _type: "slug", current: "technical" }, icon: "⚙" },
      { _type: "category", _id: "cat-vintage", name: "Vintage", slug: { _type: "slug", current: "vintage" }, icon: "◉" },
      { _type: "category", _id: "cat-interview", name: "Interview", slug: { _type: "slug", current: "interview" }, icon: "◇" },
      { _type: "category", _id: "cat-culture", name: "Culture", slug: { _type: "slug", current: "culture" }, icon: "◆" },
      { _type: "category", _id: "cat-news", name: "News", slug: { _type: "slug", current: "news" }, icon: "◆" },
    ];

    // ── 3. Tags ──
    const tags = [
      "Chronograph", "Dive Watch", "Dress Watch", "Tourbillon", "GMT", "Moonphase",
      "Automatic", "Manual Wind", "Pilot Watch", "Field Watch",
    ].map((name, i) => ({
      _type: "tag" as const,
      _id: `tag-${i}`,
      name,
      slug: { _type: "slug" as const, current: name.toLowerCase().replace(/\s+/g, "-") },
    }));

    // ── 4. Brands ──
    const brands = [
      { _id: "brand-rolex", name: "Rolex", country: "Switzerland", founded: 1905, priceSegment: "Luxury", slug: "rolex" },
      { _id: "brand-omega", name: "Omega", country: "Switzerland", founded: 1848, priceSegment: "Luxury", slug: "omega" },
      { _id: "brand-patek", name: "Patek Philippe", country: "Switzerland", founded: 1839, priceSegment: "Ultra-Luxury", slug: "patek-philippe" },
      { _id: "brand-tudor", name: "Tudor", country: "Switzerland", founded: 1926, priceSegment: "Mid-Range", slug: "tudor" },
      { _id: "brand-cartier", name: "Cartier", country: "France", founded: 1847, priceSegment: "Luxury", slug: "cartier" },
      { _id: "brand-ap", name: "Audemars Piguet", country: "Switzerland", founded: 1875, priceSegment: "Ultra-Luxury", slug: "audemars-piguet" },
      { _id: "brand-gs", name: "Grand Seiko", country: "Japan", founded: 1960, priceSegment: "Luxury", slug: "grand-seiko" },
      { _id: "brand-iwc", name: "IWC", country: "Switzerland", founded: 1868, priceSegment: "Luxury", slug: "iwc" },
      { _id: "brand-seiko", name: "Seiko", country: "Japan", founded: 1881, priceSegment: "Entry", slug: "seiko" },
    ].map((b) => ({
      _type: "brand" as const,
      _id: b._id,
      name: b.name,
      slug: { _type: "slug" as const, current: b.slug },
      country: b.country,
      founded: b.founded,
      priceSegment: b.priceSegment,
    }));

    // ── 5. Posts ──
    const posts = [
      { title: "The New Submariner: A Deep Dive", slug: "new-submariner", excerpt: "An in-depth look at the latest iteration of the iconic diving watch that has defined a category for decades.", cat: "cat-review", author: "author-james", brand: "brand-rolex", featured: true, readingTime: 8 },
      { title: "Investment Pieces: What to Buy in 2026", slug: "investment-pieces", excerpt: "Expert insights on which timepieces are likely to appreciate in value and why they matter.", cat: "cat-guide", author: "author-sofia", brand: null, featured: true, readingTime: 12 },
      { title: "Swiss Craftsmanship Through the Ages", slug: "swiss-craftsmanship", excerpt: "Exploring the centuries-old traditions that make Swiss watchmaking the gold standard.", cat: "cat-heritage", author: "author-emilia", brand: null, featured: true, readingTime: 10 },
      { title: "Understanding Complications", slug: "understanding-complications", excerpt: "A comprehensive guide to the complex mechanisms that elevate a watch from good to exceptional.", cat: "cat-technical", author: "author-luca", brand: null, featured: false, readingTime: 15 },
      { title: "The Golden Age of Horology", slug: "golden-age", excerpt: "Discovering the timeless appeal of mid-century timepieces and why collectors can't get enough.", cat: "cat-vintage", author: "author-james", brand: null, featured: false, readingTime: 9 },
      { title: "Master Watchmaker's Perspective", slug: "watchmaker-perspective", excerpt: "An exclusive conversation with one of the industry's most respected craftsmen.", cat: "cat-interview", author: "author-sofia", brand: null, featured: false, readingTime: 11 },
      { title: "Tudor Black Bay 58: The Value Champion", slug: "tudor-black-bay", excerpt: "At under $4,000, Tudor's flagship diver delivers a compelling package that rivals watches twice its price.", cat: "cat-review", author: "author-luca", brand: "brand-tudor", featured: false, readingTime: 10 },
      { title: "Watches and Cinema: A Love Story", slug: "watches-cinema", excerpt: "From James Bond's Seamaster to Tony Stark's Richard Mille — how watches define characters on screen.", cat: "cat-culture", author: "author-emilia", brand: null, featured: true, readingTime: 7 },
    ].map((p, i) => ({
      _type: "post" as const,
      _id: `post-${i}`,
      title: p.title,
      slug: { _type: "slug" as const, current: p.slug },
      excerpt: p.excerpt,
      publishedAt: new Date(2026, 1, 14 - i * 2).toISOString(),
      featured: p.featured,
      readingTime: p.readingTime,
      author: { _type: "reference" as const, _ref: p.author },
      categories: [{ _type: "reference" as const, _ref: p.cat, _key: `ck${i}` }],
      ...(p.brand ? { brand: { _type: "reference" as const, _ref: p.brand } } : {}),
      body: [
        {
          _type: "block" as const,
          _key: `b${i}a`,
          style: "normal" as const,
          children: [{ _type: "span" as const, _key: `s${i}a`, text: p.excerpt + " This is the opening paragraph of the article, providing context and setting the stage for the deep dive that follows." }],
          markDefs: [],
        },
        {
          _type: "block" as const,
          _key: `b${i}b`,
          style: "h2" as const,
          children: [{ _type: "span" as const, _key: `s${i}b`, text: "Background" }],
          markDefs: [],
        },
        {
          _type: "block" as const,
          _key: `b${i}c`,
          style: "normal" as const,
          children: [{ _type: "span" as const, _key: `s${i}c`, text: "The watch industry has seen tremendous evolution over the past decade. From the rise of independent watchmakers to the consolidation of major groups, the landscape continues to shift in fascinating ways. This article explores the key themes and developments that every enthusiast should understand." }],
          markDefs: [],
        },
        {
          _type: "block" as const,
          _key: `b${i}d`,
          style: "h2" as const,
          children: [{ _type: "span" as const, _key: `s${i}d`, text: "Analysis" }],
          markDefs: [],
        },
        {
          _type: "block" as const,
          _key: `b${i}e`,
          style: "normal" as const,
          children: [{ _type: "span" as const, _key: `s${i}e`, text: "When we look at the broader picture, several trends become clear. The appetite for quality craftsmanship shows no signs of diminishing. If anything, the digital age has increased appreciation for things made by human hands with centuries of accumulated knowledge." }],
          markDefs: [],
        },
      ],
    }));

    // ── 6. Reviews ──
    const reviews = [
      {
        _id: "review-submariner",
        title: "Rolex Submariner 126610LN",
        slug: "rolex-submariner",
        watchRef: "126610LN",
        brand: "brand-rolex",
        rating: 9.2,
        verdict: "The Submariner remains the benchmark by which all dive watches are measured.",
        specs: {
          caseSize: "41mm", caseMaterial: "Oystersteel (904L)", caseThickness: "12.5mm",
          waterResistance: "300m", crystal: "Sapphire with Cyclops", movement: "Calibre 3235",
          movementType: "Automatic", powerReserve: "70 hours", frequency: "28,800 vph",
          bracelet: "Oyster", clasp: "Oysterlock with Glidelock",
        },
        prosAndCons: {
          pros: ["Exceptional build quality", "70-hour power reserve", "Glidelock clasp", "Excellent lume", "Strong resale value"],
          cons: ["Hard to get at retail", "Cyclops is polarizing", "Incremental updates"],
        },
        priceRange: { min: 10250, max: 14800, currency: "USD" },
      },
    ].map((r) => ({
      _type: "review" as const,
      _id: r._id,
      title: r.title,
      slug: { _type: "slug" as const, current: r.slug },
      watchRef: r.watchRef,
      brand: { _type: "reference" as const, _ref: r.brand },
      rating: r.rating,
      verdict: r.verdict,
      specs: r.specs,
      prosAndCons: r.prosAndCons,
      priceRange: r.priceRange,
      author: { _type: "reference" as const, _ref: "author-james" },
      publishedAt: new Date(2026, 1, 10).toISOString(),
      body: [
        {
          _type: "block" as const, _key: "rb1", style: "normal" as const,
          children: [{ _type: "span" as const, _key: "rs1", text: "The Rolex Submariner needs no introduction. Since 1953, it has defined what a dive watch should be." }],
          markDefs: [],
        },
      ],
    }));

    // ── 7. Site Settings ──
    const settings = {
      _type: "siteSettings",
      _id: "siteSettings",
      siteName: "Chronos",
      socials: {
        instagram: "https://instagram.com/chronos",
        twitter: "https://twitter.com/chronos",
        youtube: "https://youtube.com/chronos",
      },
    };

    // ── Execute all mutations ──
    const transaction = writeClient.transaction();

    authors.forEach((doc) => transaction.createIfNotExists(doc));
    categories.forEach((doc) => transaction.createIfNotExists(doc));
    tags.forEach((doc) => transaction.createIfNotExists(doc));
    brands.forEach((doc) => transaction.createIfNotExists(doc));
    posts.forEach((doc) => transaction.createIfNotExists(doc));
    reviews.forEach((doc) => transaction.createIfNotExists(doc));
    transaction.createIfNotExists(settings);

    const result = await transaction.commit();

    return NextResponse.json({
      success: true,
      message: "Seed data created!",
      stats: {
        authors: authors.length,
        categories: categories.length,
        tags: tags.length,
        brands: brands.length,
        posts: posts.length,
        reviews: reviews.length,
      },
      transactionId: result.transactionId,
    });
  } catch (error) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Seed failed";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 500
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
