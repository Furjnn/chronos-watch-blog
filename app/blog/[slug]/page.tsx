import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogPostClient from "./BlogPostClient";
import { renderTiptapContent } from "@/lib/tiptap-renderer";
import type { Metadata } from "next";
import Image from "next/image";
import type { JSONContent } from "@tiptap/core";

export const revalidate = 3600;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, seoTitle: true, seoDesc: true, coverImage: true, ogImage: true },
  });
  if (!post) return { title: "Not Found" };
  const image = post.ogImage || post.coverImage || fallbackImg;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt || "",
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${siteUrl}/blog/${slug}`,
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt || "",
      images: [{ url: image }],
    },
  };
}

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, categories: true, tags: true, brand: true },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  // Increment views
  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const avatar = (post.author?.name || "C").split(" ").map(w => w[0]).join("");
  const heroImg = post.coverImage || fallbackImg;
  const catName = post.categories[0]?.name || "Article";
  const tags = post.tags.map(t => t.name);
  const publishedAtIso = post.publishedAt ? post.publishedAt.toISOString() : new Date().toISOString();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDesc || post.excerpt || "",
    datePublished: publishedAtIso,
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "Chronos",
    },
    image: [post.ogImage || post.coverImage || fallbackImg],
    publisher: {
      "@type": "Organization",
      name: "Chronos",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  // Related posts - same category
  const relatedPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED", id: { not: post.id }, categories: { some: { id: { in: post.categories.map(c => c.id) } } } },
    take: 3, orderBy: { publishedAt: "desc" },
    include: { categories: true },
  });

  const related = relatedPosts.map(p => ({
    id: p.id, title: p.title,
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    img: p.coverImage || fallbackImg,
    slug: p.slug,
    cat: p.categories[0]?.name || "Article",
  }));

  // Render Tiptap body
  const bodyContent = post.body ? renderTiptapContent(post.body as JSONContent) : null;

  return (
    <BlogPostClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero */}
      <section className="pt-14">
        <div className="relative overflow-hidden" style={{ height: "60vh", minHeight: 400, maxHeight: 560 }}>
          <Image src={heroImg} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)" }} />
        </div>
      </section>

      {/* Article Header */}
      <section className="bg-[var(--bg)]">
        <div className="max-w-[720px] mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-[var(--bg)] pt-10">
            <div className="text-[12px] text-[var(--text-light)] mb-5">
              <Link href="/" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Home</Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <Link href="/blog" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Blog</Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <span className="text-[var(--text)]">{post.title}</span>
            </div>
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 text-white bg-[#2D6A4F] inline-block mb-4">{catName}</span>
            <h1 className="text-[var(--charcoal)] leading-[1.15] mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,46px)", fontWeight: 400 }}>{post.title}</h1>
            <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex items-center gap-3.5 pb-7 border-b border-[var(--border)]">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[16px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{avatar}</div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--charcoal)]">{post.author?.name}</div>
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-light)] mt-0.5">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="text-[var(--border)]">·</span>
                  <span>⏱ {post.readingTime || 8} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-[720px] mx-auto px-6 pt-10">
        <div className="article-body">
          {bodyContent}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 pt-7 border-t border-[var(--border)] flex items-center gap-2 flex-wrap mb-6">
            <span className="text-[12px] text-[var(--text-light)] mr-1">Tags:</span>
            {tags.map(tag => (
              <span key={tag} className="text-[11.5px] px-3 py-1 border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">{tag}</span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {post.author && (
          <div className="mb-14 p-8 bg-[var(--bg-off)] border border-[var(--border)] flex gap-6">
            <div className="w-[72px] h-[72px] min-w-[72px] rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[24px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{avatar}</div>
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-1">Written by</div>
              <div className="text-[22px] font-medium text-[var(--charcoal)] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{post.author.name}</div>
              <div className="text-[12.5px] text-[var(--text-light)] mb-2.5">{post.author.role}</div>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{post.author.bio}</p>
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-14 bg-[var(--bg-warm)]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Keep Reading</div>
            <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Related Articles</h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {related.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="no-underline group">
                  <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "16/10" }}>
                    <Image src={rp.img} alt={rp.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <h3 className="text-[19px] font-medium leading-tight mb-2 group-hover:text-[var(--gold-dark)] text-[var(--charcoal)] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{rp.title}</h3>
                  <div className="text-[12px] text-[var(--text-light)]">{rp.date} · ⏱ {rp.readTime}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </BlogPostClient>
  );
}
