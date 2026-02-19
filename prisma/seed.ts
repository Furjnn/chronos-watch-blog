// prisma/seed.ts
// Run with: npx tsx prisma/seed.ts

import { Prisma, PrismaClient, type PriceSegment } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type TiptapNode = Record<string, unknown>;
type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function paragraph(text: string): TiptapNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(text: string, level: 2 | 3 = 2): TiptapNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function bulletList(items: string[]): TiptapNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: item }],
        },
      ],
    })),
  };
}

function image(src: string, alt: string): TiptapNode {
  return {
    type: "image",
    attrs: { src, alt, title: alt },
  };
}

function doc(...content: TiptapNode[]): TiptapDoc {
  return { type: "doc", content };
}

const IMG = {
  heroA: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1800&q=80&auto=format&fit=crop",
  heroB: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1800&q=80&auto=format&fit=crop",
  heroC: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1800&q=80&auto=format&fit=crop",
  heroD: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1800&q=80&auto=format&fit=crop",
  heroE: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=1800&q=80&auto=format&fit=crop",
  heroF: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1800&q=80&auto=format&fit=crop",
  heroG: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=1800&q=80&auto=format&fit=crop",
  heroH: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1800&q=80&auto=format&fit=crop",
  heroI: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1800&q=80&auto=format&fit=crop",
  heroJ: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80&auto=format&fit=crop",
  heroK: "https://images.unsplash.com/photo-1415604934674-561df9abf539?w=1800&q=80&auto=format&fit=crop",
  heroL: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1800&q=80&auto=format&fit=crop",
  fallback: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1800&q=80&auto=format&fit=crop",
  avatarA: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
  avatarB: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  avatarC: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  avatarD: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
  avatarE: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&q=80",
} as const;

async function main() {
  console.log("Seeding database with editorial demo content...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: "Chronos Admin",
        passwordHash,
        role: "ADMIN",
      },
      create: {
        email: adminEmail,
        name: "Chronos Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  } else {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    if (existingAdmin) {
      console.log(`Using existing admin account: ${existingAdmin.email}`);
    } else {
      const fallbackEmail = "admin@chronos.local";
      const fallbackPassword = "ChronosAdmin123!";
      const passwordHash = await bcrypt.hash(fallbackPassword, 12);

      await prisma.user.create({
        data: {
          email: fallbackEmail,
          name: "Chronos Admin",
          passwordHash,
          role: "ADMIN",
        },
      });

      console.log(
        `No ADMIN_EMAIL/ADMIN_PASSWORD found. Created fallback admin: ${fallbackEmail} / ${fallbackPassword}`,
      );
    }
  }

  console.log("Clearing existing sample content...");
  await prisma.$transaction([
    prisma.post.deleteMany(),
    prisma.review.deleteMany(),
    prisma.category.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.author.deleteMany(),
  ]);

  const authors = [
    {
      name: "Darren Cole",
      slug: "darren-cole",
      role: "Editor in Chief",
      bio: "Darren has covered mechanical watches for over a decade, focusing on product strategy and long-term ownership value.",
      avatar: IMG.avatarA,
    },
    {
      name: "Aylin Demir",
      slug: "aylin-demir",
      role: "Technical Editor",
      bio: "Aylin is a former watchmaker who now translates movement architecture and service realities into practical buying advice.",
      avatar: IMG.avatarB,
    },
    {
      name: "Mert Kaya",
      slug: "mert-kaya",
      role: "Market Analyst",
      bio: "Mert tracks secondary market liquidity, pricing cycles, and collector behavior across modern and neo-vintage references.",
      avatar: IMG.avatarC,
    },
    {
      name: "Selin Oz",
      slug: "selin-oz",
      role: "Heritage Writer",
      bio: "Selin writes on design lineage and military-to-civilian transitions in watchmaking history.",
      avatar: IMG.avatarD,
    },
    {
      name: "Leo Hart",
      slug: "leo-hart",
      role: "Field Reviewer",
      bio: "Leo reviews watches in daily conditions, with an emphasis on wearability, legibility, and durability over time.",
      avatar: IMG.avatarE,
    },
  ];
  await prisma.author.createMany({ data: authors });

  const categories = [
    { name: "Review", slug: "review", icon: "star", description: "Hands-on reviews and practical verdicts." },
    { name: "Guide", slug: "guide", icon: "guide", description: "Buying guides and ownership tips." },
    { name: "Heritage", slug: "heritage", icon: "heritage", description: "Historical context and design evolution." },
    { name: "Technical", slug: "technical", icon: "technical", description: "Movements, materials, and engineering." },
    { name: "Vintage", slug: "vintage", icon: "vintage", description: "Collector-focused vintage coverage." },
    { name: "Interview", slug: "interview", icon: "interview", description: "Industry voices and maker conversations." },
    { name: "Culture", slug: "culture", icon: "culture", description: "Watch culture and lifestyle stories." },
    { name: "News", slug: "news", icon: "news", description: "Market and product updates." },
  ];
  await prisma.category.createMany({ data: categories });

  const tagNames = [
    "Chronograph",
    "Dive Watch",
    "GMT",
    "Manual Wind",
    "Automatic",
    "Titanium",
    "Ceramic Bezel",
    "Spring Drive",
    "Everyday Watch",
    "Investment",
    "Vintage Market",
    "Dress Watch",
    "Field Watch",
    "Service Tips",
    "Pilot Watch",
  ];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name, slug: slugify(name) })),
  });

  const brands: Array<{
    name: string;
    slug: string;
    country: string;
    founded: number;
    priceSegment: PriceSegment;
    description: string;
    website: string;
    heroImage: string;
    logo: string;
  }> = [
    {
      name: "Rolex",
      slug: "rolex",
      country: "Switzerland",
      founded: 1905,
      priceSegment: "LUXURY",
      description: "Rolex continues to define mainstream luxury watch benchmarks with robust engineering and strong resale demand.",
      website: "https://www.rolex.com",
      heroImage: IMG.heroA,
      logo: IMG.heroA,
    },
    {
      name: "Omega",
      slug: "omega",
      country: "Switzerland",
      founded: 1848,
      priceSegment: "LUXURY",
      description: "Omega balances heritage with modern production efficiency, particularly in chronographs and antimagnetic movements.",
      website: "https://www.omegawatches.com",
      heroImage: IMG.heroB,
      logo: IMG.heroB,
    },
    {
      name: "Tudor",
      slug: "tudor",
      country: "Switzerland",
      founded: 1926,
      priceSegment: "MID_RANGE",
      description: "Tudor is one of the strongest value propositions in Swiss sports watches, with practical specs and honest pricing.",
      website: "https://www.tudorwatch.com",
      heroImage: IMG.heroC,
      logo: IMG.heroC,
    },
    {
      name: "Grand Seiko",
      slug: "grand-seiko",
      country: "Japan",
      founded: 1960,
      priceSegment: "LUXURY",
      description: "Grand Seiko combines refined finishing with unique movement technologies such as Spring Drive.",
      website: "https://www.grand-seiko.com",
      heroImage: IMG.heroD,
      logo: IMG.heroD,
    },
    {
      name: "Longines",
      slug: "longines",
      country: "Switzerland",
      founded: 1832,
      priceSegment: "MID_RANGE",
      description: "Longines offers heritage-focused designs with reliable modern calibers and wide retail availability.",
      website: "https://www.longines.com",
      heroImage: IMG.heroE,
      logo: IMG.heroE,
    },
    {
      name: "Oris",
      slug: "oris",
      country: "Switzerland",
      founded: 1904,
      priceSegment: "MID_RANGE",
      description: "Oris remains independent and product-driven, known for practical tool watches and strong dial execution.",
      website: "https://www.oris.ch",
      heroImage: IMG.heroF,
      logo: IMG.heroF,
    },
    {
      name: "Cartier",
      slug: "cartier",
      country: "France",
      founded: 1847,
      priceSegment: "LUXURY",
      description: "Cartier dominates the modern dress-watch conversation with design signatures that age exceptionally well.",
      website: "https://www.cartier.com",
      heroImage: IMG.heroG,
      logo: IMG.heroG,
    },
    {
      name: "Jaeger-LeCoultre",
      slug: "jaeger-lecoultre",
      country: "Switzerland",
      founded: 1833,
      priceSegment: "ULTRA_LUXURY",
      description: "Jaeger-LeCoultre blends movement pedigree with understated case design and high finishing quality.",
      website: "https://www.jaeger-lecoultre.com",
      heroImage: IMG.heroH,
      logo: IMG.heroH,
    },
    {
      name: "Seiko",
      slug: "seiko",
      country: "Japan",
      founded: 1881,
      priceSegment: "ENTRY",
      description: "Seiko covers a broad spectrum and remains the entry point for many enthusiasts building technical knowledge.",
      website: "https://www.seikowatches.com",
      heroImage: IMG.heroI,
      logo: IMG.heroI,
    },
  ];
  await prisma.brand.createMany({ data: brands });

  const [authorRows, categoryRows, tagRows, brandRows] = await Promise.all([
    prisma.author.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.tag.findMany({ select: { id: true, slug: true } }),
    prisma.brand.findMany({ select: { id: true, slug: true } }),
  ]);

  const authorIdBySlug = Object.fromEntries(authorRows.map((row) => [row.slug, row.id])) as Record<string, string>;
  const categoryIdBySlug = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id])) as Record<string, string>;
  const tagIdBySlug = Object.fromEntries(tagRows.map((row) => [row.slug, row.id])) as Record<string, string>;
  const brandIdBySlug = Object.fromEntries(brandRows.map((row) => [row.slug, row.id])) as Record<string, string>;

  const posts = [
    {
      title: "Omega Speedmaster in 2026: What Actually Improved",
      slug: "omega-speedmaster-2026-improvements",
      excerpt: "A practical ownership-focused look at bracelet comfort, serviceability, and long-term value in the latest Speedmaster generation.",
      seoTitle: "Omega Speedmaster 2026 Review | What Improved",
      seoDesc: "Hands-on analysis of the newest Speedmaster updates with ownership and servicing context.",
      authorSlug: "darren-cole",
      brandSlug: "omega",
      categorySlugs: ["review", "technical"],
      tagSlugs: ["chronograph", "manual-wind", "everyday-watch"],
      coverImage: IMG.heroB,
      featured: true,
      readingTime: 11,
      views: 12450,
      publishedAt: daysAgo(1),
      body: doc(
        heading("Why this update matters", 2),
        paragraph("Most Speedmaster updates look incremental on paper, but ownership quality is often defined by small physical details. The 2026 update improves wearability first: bracelet articulation, clasp adjustment precision, and a slightly cleaner case transition at the lugs."),
        paragraph("The movement architecture remains familiar, which is a good thing for independent serviceability and parts predictability. For buyers planning five to ten years of ownership, that stability is more important than dramatic novelty."),
        image(IMG.heroJ, "Speedmaster case detail"),
        heading("Best fit for this watch", 3),
        bulletList([
          "Collectors who want one daily chronograph with proven service paths",
          "Buyers who prioritize wear comfort over spec-sheet extremes",
          "Owners moving from entry chronographs into a long-term piece",
        ]),
      ),
    },
    {
      title: "Buying Your First GMT Watch: 5 Mistakes to Avoid",
      slug: "first-gmt-watch-mistakes",
      excerpt: "A step-by-step framework for selecting your first GMT without overpaying for hype features you will not use.",
      seoTitle: "First GMT Watch Guide | Avoid These 5 Mistakes",
      seoDesc: "A practical GMT buying guide covering case size, bezel usability, and movement trade-offs.",
      authorSlug: "aylin-demir",
      brandSlug: null,
      categorySlugs: ["guide"],
      tagSlugs: ["gmt", "everyday-watch", "investment"],
      coverImage: IMG.heroC,
      featured: true,
      readingTime: 9,
      views: 9840,
      publishedAt: daysAgo(3),
      body: doc(
        heading("Start with your travel pattern", 2),
        paragraph("Most buyers decide by social media popularity, then discover the watch does not suit their routine. If you travel monthly, prioritize fast local-hour adjustment. If travel is rare, legibility and bracelet comfort should come first."),
        paragraph("Case thickness matters more than diameter for long flights and office wear. A 39-40mm case with reasonable lug length usually works for most wrists."),
        heading("Avoid these common errors", 3),
        bulletList([
          "Paying extra for a rotating bezel you never use",
          "Ignoring clasp quality and micro-adjustment",
          "Choosing colorway first, movement quality second",
        ]),
      ),
    },
    {
      title: "Why Neo-Vintage Sports Watches Keep Gaining Demand",
      slug: "neo-vintage-demand-analysis",
      excerpt: "Supply constraints and collector behavior are pushing clean 1990s and early-2000s references into a new pricing phase.",
      seoTitle: "Neo-Vintage Watch Market 2026 | Demand Analysis",
      seoDesc: "Collector demand, condition risk, and liquidity trends in neo-vintage sports watches.",
      authorSlug: "mert-kaya",
      brandSlug: null,
      categorySlugs: ["vintage", "culture"],
      tagSlugs: ["vintage-market", "investment"],
      coverImage: IMG.heroH,
      featured: true,
      readingTime: 10,
      views: 11120,
      publishedAt: daysAgo(5),
      body: doc(
        heading("Condition has become the main price driver", 2),
        paragraph("Over the last two years, collectors shifted from chasing only reference numbers to chasing complete, low-polish examples. Box and papers still matter, but case geometry and dial originality now carry higher premiums."),
        paragraph("Liquidity remains strongest in references with straightforward service histories. Complex or unsupported calibers can reduce resale speed even when headline prices look attractive."),
        image(IMG.heroK, "Neo-vintage watch collection"),
      ),
    },
    {
      title: "Smaller Cases Are Back: Why 36-38mm Feels Modern Again",
      slug: "smaller-watch-cases-are-back",
      excerpt: "After a decade of oversized sports models, brands are returning to balanced proportions that work in real daily wear.",
      seoTitle: "36-38mm Watch Trend | Why Smaller Cases Are Back",
      seoDesc: "How case proportions, lug geometry, and dial design made smaller watches relevant again.",
      authorSlug: "selin-oz",
      brandSlug: null,
      categorySlugs: ["news", "culture"],
      tagSlugs: ["everyday-watch", "dress-watch"],
      coverImage: IMG.heroI,
      featured: true,
      readingTime: 7,
      views: 8320,
      publishedAt: daysAgo(7),
      body: doc(
        heading("Design reset, not nostalgia", 2),
        paragraph("The move back to 36-38mm is not only retro marketing. It reflects broader demand for lower profile watches that transition from office to weekend without feeling oversized."),
        paragraph("Modern dial contrast and better anti-reflective coatings allow smaller watches to remain highly legible, reducing the old argument that larger cases are necessary."),
      ),
    },
    {
      title: "Inside Grand Seiko Spring Drive: Accuracy in Real Life",
      slug: "grand-seiko-spring-drive-explained",
      excerpt: "Beyond marketing claims, this guide explains what Spring Drive ownership feels like day to day.",
      seoTitle: "Grand Seiko Spring Drive Guide | Practical Accuracy",
      seoDesc: "A practical explanation of Spring Drive behavior, service expectations, and ownership fit.",
      authorSlug: "aylin-demir",
      brandSlug: "grand-seiko",
      categorySlugs: ["technical", "guide"],
      tagSlugs: ["spring-drive", "automatic"],
      coverImage: IMG.heroD,
      featured: false,
      readingTime: 12,
      views: 7650,
      publishedAt: daysAgo(9),
      body: doc(
        heading("How it differs in daily use", 2),
        paragraph("Spring Drive combines a mainspring power source with an electronically regulated glide wheel. In practice, owners notice consistent timekeeping and a smoother seconds hand that makes visual reading easier."),
        paragraph("Service intervals are similar to other premium mechanical watches, but users should expect service to run through qualified channels because of movement complexity."),
        image(IMG.heroD, "Grand Seiko dial close-up"),
      ),
    },
    {
      title: "Weekend Test: Tudor Black Bay 58 GMT",
      slug: "tudor-black-bay-58-gmt-weekend-test",
      excerpt: "We wore the BB58 GMT for commuting, travel, and desk work to evaluate comfort, legibility, and practical timezone use.",
      seoTitle: "Tudor Black Bay 58 GMT Weekend Test",
      seoDesc: "Real-world test of Tudor BB58 GMT with comfort and usability findings.",
      authorSlug: "leo-hart",
      brandSlug: "tudor",
      categorySlugs: ["review"],
      tagSlugs: ["gmt", "dive-watch", "everyday-watch"],
      coverImage: IMG.heroE,
      featured: false,
      readingTime: 8,
      views: 6980,
      publishedAt: daysAgo(11),
      body: doc(
        heading("Comfort first", 2),
        paragraph("At this size, Tudor found a strong balance between wrist presence and long-session comfort. The clasp mechanism is simple and dependable, and the bezel action remains precise after heavy weekend use."),
        heading("Where it excels", 3),
        bulletList([
          "Readable local and home time at a glance",
          "Excellent bracelet-to-case integration",
          "Strong value against direct Swiss competitors",
        ]),
      ),
    },
    {
      title: "How to Service a Mechanical Watch Without Overpaying",
      slug: "mechanical-watch-service-cost-guide",
      excerpt: "A transparent service checklist to help owners compare quotations and avoid unnecessary replacement work.",
      seoTitle: "Mechanical Watch Service Guide | Avoid Overpaying",
      seoDesc: "Checklist for evaluating service quotes, turnaround times, and parts replacement policies.",
      authorSlug: "aylin-demir",
      brandSlug: null,
      categorySlugs: ["guide", "technical"],
      tagSlugs: ["service-tips", "automatic"],
      coverImage: IMG.heroL,
      featured: false,
      readingTime: 10,
      views: 7210,
      publishedAt: daysAgo(13),
      body: doc(
        heading("Ask for a parts list before approval", 2),
        paragraph("Most overpaying happens when owners approve broad service scopes without a line-by-line estimate. Request explicit pricing for mainspring, crown, crystal, and gaskets before work starts."),
        paragraph("If you prioritize originality, note that case and bracelet refinishing should be optional. Original geometry usually preserves value better than aggressive polishing."),
      ),
    },
    {
      title: "Field Watches: From Military Tool to Modern Daily Wear",
      slug: "field-watch-history-and-modern-use",
      excerpt: "A concise history of field watches and why their simple design still fits modern daily routines.",
      seoTitle: "Field Watch History and Modern Use Guide",
      seoDesc: "Design history and practical buying advice for modern field watches.",
      authorSlug: "selin-oz",
      brandSlug: null,
      categorySlugs: ["heritage", "guide"],
      tagSlugs: ["field-watch", "everyday-watch", "pilot-watch"],
      coverImage: IMG.heroG,
      featured: false,
      readingTime: 9,
      views: 6530,
      publishedAt: daysAgo(16),
      body: doc(
        heading("Why the formula still works", 2),
        paragraph("Field watches prioritize immediate readability, durable cases, and restrained dimensions. Those same traits align with modern office-to-weekend use better than many bulkier sports models."),
        paragraph("For first-time buyers, prioritize dial contrast and lug-to-lug length over marketing language."),
      ),
    },
    {
      title: "Best Dress Watches Under $5,000 in 2026",
      slug: "best-dress-watches-under-5000-2026",
      excerpt: "A shortlist of refined dress watches with strong finishing, dependable movements, and realistic service economics.",
      seoTitle: "Best Dress Watches Under $5,000 | 2026 Picks",
      seoDesc: "Top dress watch options under $5,000 with value and ownership context.",
      authorSlug: "darren-cole",
      brandSlug: "cartier",
      categorySlugs: ["guide", "review"],
      tagSlugs: ["dress-watch", "manual-wind", "investment"],
      coverImage: IMG.heroF,
      featured: false,
      readingTime: 8,
      views: 5990,
      publishedAt: daysAgo(19),
      body: doc(
        heading("What matters in this price tier", 2),
        paragraph("Under $5,000, the best dress watches combine clean case execution, good dial texture, and proven calibers. Ignore inflated marketing around in-house complexity unless it improves ownership value."),
        paragraph("Small details like crown feel, hand alignment, and crystal distortion often distinguish great options from average ones."),
      ),
    },
  ] as const;

  for (const post of posts) {
    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body as Prisma.InputJsonValue,
        coverImage: post.coverImage,
        ogImage: post.coverImage,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
        featured: post.featured,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt,
        seoTitle: post.seoTitle,
        seoDesc: post.seoDesc,
        views: post.views,
        authorId: authorIdBySlug[post.authorSlug],
        brandId: post.brandSlug ? brandIdBySlug[post.brandSlug] : null,
        categories: {
          connect: post.categorySlugs.map((slug) => ({ id: categoryIdBySlug[slug] })),
        },
        tags: {
          connect: post.tagSlugs.map((slug) => ({ id: tagIdBySlug[slug] })),
        },
      },
    });
  }

  const reviews = [
    {
      title: "Rolex Submariner 126610LN",
      slug: "rolex-submariner-126610ln-review",
      watchRef: "126610LN",
      rating: 9.1,
      verdict: "The Submariner remains the most complete luxury dive watch package when durability, service network, and liquidity are considered together.",
      authorSlug: "darren-cole",
      brandSlug: "rolex",
      priceMin: 10250,
      priceMax: 15000,
      publishedAt: daysAgo(2),
      gallery: [IMG.heroA, IMG.heroJ, IMG.heroK],
      specs: {
        caseSize: "41mm",
        movement: "Calibre 3235",
        waterResistance: "300m",
        powerReserve: "70 hours",
        caseMaterial: "Oystersteel",
        frequency: "28,800 vph",
      },
      prosAndCons: {
        pros: [
          "Outstanding bracelet and clasp execution",
          "Excellent everyday legibility",
          "Strong value retention in most markets",
        ],
        cons: [
          "Persistent retail availability issues",
          "Premium over retail can be hard to justify",
        ],
      },
      body: doc(
        paragraph("Rolex has not changed the core Submariner formula because it works. The 41mm case wears balanced due to controlled lug geometry, and the movement remains one of the most dependable in the category."),
        paragraph("In ownership terms, the strongest advantage is predictability: service support, parts access through official channels, and broad secondary-market demand."),
      ),
    },
    {
      title: "Omega Speedmaster Professional",
      slug: "omega-speedmaster-professional-review",
      watchRef: "310.30.42.50.01.001",
      rating: 8.9,
      verdict: "A historically important chronograph that now offers better bracelet comfort and better overall day-to-day wear than older generations.",
      authorSlug: "aylin-demir",
      brandSlug: "omega",
      priceMin: 7000,
      priceMax: 8900,
      publishedAt: daysAgo(6),
      gallery: [IMG.heroB, IMG.heroD, IMG.heroL],
      specs: {
        caseSize: "42mm",
        movement: "Calibre 3861",
        waterResistance: "50m",
        powerReserve: "50 hours",
        crystal: "Hesalite or Sapphire",
      },
      prosAndCons: {
        pros: [
          "Iconic design with real historical continuity",
          "Improved bracelet articulation",
          "Reliable manual-wind experience",
        ],
        cons: [
          "Limited water resistance for a daily-only watch",
          "Hand-winding routine is not for every buyer",
        ],
      },
      body: doc(
        paragraph("The modern Speedmaster is best understood as a daily chronograph with heritage value, not as a spec-first sports watch. Once that context is clear, the package is compelling."),
        paragraph("The current bracelet and clasp setup is a meaningful quality-of-life improvement, especially for long office use and travel."),
      ),
    },
    {
      title: "Tudor Black Bay 58 GMT",
      slug: "tudor-black-bay-58-gmt-review",
      watchRef: "M7939G1A0NRU-0001",
      rating: 8.7,
      verdict: "Tudor delivers one of the most balanced GMT experiences in its class with practical dimensions and excellent bracelet quality.",
      authorSlug: "leo-hart",
      brandSlug: "tudor",
      priceMin: 4350,
      priceMax: 5200,
      publishedAt: daysAgo(10),
      gallery: [IMG.heroE, IMG.heroC, IMG.heroI],
      specs: {
        caseSize: "39mm",
        movement: "MT5450-U",
        waterResistance: "200m",
        powerReserve: "65 hours",
        bracelet: "Steel with T-fit clasp",
      },
      prosAndCons: {
        pros: [
          "Excellent wearability",
          "Strong travel-ready timezone implementation",
          "Competitive pricing against peers",
        ],
        cons: [
          "Date window layout is divisive for some buyers",
          "Limited bracelet taper options",
        ],
      },
      body: doc(
        paragraph("This is a GMT built for actual use, not only for spec-sheet comparisons. Legibility stays strong in mixed lighting, and the case sits flatter than many similarly capable competitors."),
      ),
    },
    {
      title: "Grand Seiko SBGA413 Shunbun",
      slug: "grand-seiko-sbga413-shunbun-review",
      watchRef: "SBGA413",
      rating: 9.0,
      verdict: "One of the most refined everyday luxury watches thanks to exceptional dial finishing, titanium comfort, and Spring Drive stability.",
      authorSlug: "mert-kaya",
      brandSlug: "grand-seiko",
      priceMin: 6200,
      priceMax: 7500,
      publishedAt: daysAgo(14),
      gallery: [IMG.heroD, IMG.heroF, IMG.heroH],
      specs: {
        caseSize: "40mm",
        movement: "9R65 Spring Drive",
        waterResistance: "100m",
        powerReserve: "72 hours",
        caseMaterial: "High-intensity titanium",
      },
      prosAndCons: {
        pros: [
          "Class-leading dial craftsmanship",
          "Very comfortable titanium case",
          "Impressive daily accuracy consistency",
        ],
        cons: [
          "Polished surfaces show hairlines quickly",
          "Brand storytelling can be less familiar to new buyers",
        ],
      },
      body: doc(
        paragraph("The SBGA413 succeeds because it combines emotional design with practical ownership traits. It is light on the wrist, highly legible, and consistent in daily timing behavior."),
      ),
    },
  ] as const;

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        title: review.title,
        slug: review.slug,
        watchRef: review.watchRef,
        rating: review.rating,
        verdict: review.verdict,
        body: review.body as Prisma.InputJsonValue,
        specs: review.specs as Prisma.InputJsonValue,
        prosAndCons: review.prosAndCons as Prisma.InputJsonValue,
        gallery: review.gallery as Prisma.InputJsonValue,
        priceMin: review.priceMin,
        priceMax: review.priceMax,
        currency: "USD",
        status: "PUBLISHED",
        publishedAt: review.publishedAt,
        seoTitle: `${review.title} Review`,
        seoDesc: review.verdict,
        ogImage: review.gallery[0] || IMG.fallback,
        authorId: authorIdBySlug[review.authorSlug],
        brandId: brandIdBySlug[review.brandSlug],
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      siteName: "Chronos",
      seoTitle: "Chronos | Watch Reviews, Guides, and Market Insight",
      seoDescription: "Chronos delivers practical watch reviews, buying guides, and market analysis for collectors and new buyers.",
      ogImage: IMG.heroA,
      footerText: "Independent editorial coverage for modern watch enthusiasts.",
    },
    create: {
      id: "main",
      siteName: "Chronos",
      seoTitle: "Chronos | Watch Reviews, Guides, and Market Insight",
      seoDescription: "Chronos delivers practical watch reviews, buying guides, and market analysis for collectors and new buyers.",
      ogImage: IMG.heroA,
      footerText: "Independent editorial coverage for modern watch enthusiasts.",
    },
  });

  const [authorCount, brandCount, categoryCount, tagCount, postCount, reviewCount] = await Promise.all([
    prisma.author.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.post.count(),
    prisma.review.count(),
  ]);

  console.log("Seed complete.");
  console.log(
    `Created ${authorCount} authors, ${brandCount} brands, ${categoryCount} categories, ${tagCount} tags, ${postCount} posts, ${reviewCount} reviews.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
