import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogPostClient from "./BlogPostClient";
import { renderTiptapContent } from "@/lib/tiptap-renderer";
import type { Metadata } from "next";
import Image from "next/image";
import type { JSONContent } from "@tiptap/core";
import { getDictionary, getLocale } from "@/lib/i18n";
import { formatDateByLocale } from "@/lib/i18n/format";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { localizePathname } from "@/lib/i18n/routing";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import CommentSection from "@/components/comments/CommentSection";
import AdSlot from "@/components/ads/AdSlot";
import { ADSENSE_SLOTS } from "@/lib/ads";

export const revalidate = 3600;
const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { slug } = await params;
  const alternates = getLocaleAlternates(`/blog/${slug}`, locale);

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, seoTitle: true, seoDesc: true, coverImage: true, ogImage: true },
  });

  if (!post) {
    return { title: dictionary.notFound.title };
  }

  const image = post.ogImage || post.coverImage || fallbackImg;

  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt || "",
    alternates,
    openGraph: {
      type: "article",
      url: absoluteUrl(alternates.canonical),
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.excerpt || "",
      images: [{ url: image }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, categories: true, tags: true, brand: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const avatar = (post.author?.name || "C")
    .split(" ")
    .map((word) => word[0])
    .join("");
  const heroImg = post.coverImage || fallbackImg;
  const categoryName = post.categories[0]?.name || dictionary.search.typeArticle;
  const tags = post.tags.map((tag) => tag.name);
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
    mainEntityOfPage: absoluteUrl(localizePathname(`/blog/${post.slug}`, locale)),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dictionary.common.home,
        item: absoluteUrl(localizePathname("/", locale)),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dictionary.common.blog,
        item: absoluteUrl(localizePathname("/blog", locale)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(localizePathname(`/blog/${post.slug}`, locale)),
      },
    ],
  };

  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      categories: { some: { id: { in: post.categories.map((category) => category.id) } } },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { categories: true },
  });

  const related = relatedPosts.map((relatedPost) => ({
    id: relatedPost.id,
    title: relatedPost.title,
    date: formatDateByLocale(relatedPost.publishedAt, locale, { month: "long", day: "numeric", year: "numeric" }),
    readTime: `${relatedPost.readingTime || 8} ${dictionary.common.min}`,
    img: relatedPost.coverImage || fallbackImg,
    slug: relatedPost.slug,
    cat: relatedPost.categories[0]?.name || dictionary.search.typeArticle,
  }));

  const bodyContent = post.body ? renderTiptapContent(post.body as JSONContent) : null;

  return (
    <BlogPostClient>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="pt-14">
        <div className="relative overflow-hidden" style={{ height: "60vh", minHeight: 400, maxHeight: 560 }}>
          <Image src={heroImg} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)" }} />
        </div>
      </section>

      <section className="bg-[var(--bg)]">
        <div className="max-w-[720px] mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-[var(--bg)] pt-10">
            <div className="text-[12px] text-[var(--text-light)] mb-5">
              <Link href={localizePathname("/", locale)} className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">
                {dictionary.common.home}
              </Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <Link href={localizePathname("/blog", locale)} className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">
                {dictionary.common.blog}
              </Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <span className="text-[var(--text)]">{post.title}</span>
            </div>
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 text-white bg-[#2D6A4F] inline-block mb-4">{categoryName}</span>
            <h1 className="text-[var(--charcoal)] leading-[1.15] mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,46px)", fontWeight: 400 }}>
              {post.title}
            </h1>
            <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex items-center gap-3.5 pb-7 border-b border-[var(--border)]">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[16px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                {avatar}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--charcoal)]">{post.author?.name || "Chronos"}</div>
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-light)] mt-0.5">
                  <span>{formatDateByLocale(post.publishedAt, locale, { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span className="text-[var(--border)]">&middot;</span>
                  <span>{`${post.readingTime || 8} ${dictionary.common.minRead}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="max-w-[720px] mx-auto px-6 pt-10">
        <div className="article-body">{bodyContent}</div>
        <AdSlot slot={ADSENSE_SLOTS.blogPostInline} />

        {tags.length > 0 && (
          <div className="mt-12 pt-7 border-t border-[var(--border)] flex items-center gap-2 flex-wrap mb-6">
            <span className="text-[12px] text-[var(--text-light)] mr-1">{dictionary.blogPost.tags}</span>
            {tags.map((tag) => (
              <span key={tag} className="text-[11.5px] px-3 py-1 border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.author && (
          <div className="mb-14 p-8 bg-[var(--bg-off)] border border-[var(--border)] flex gap-6">
            <div className="w-[72px] h-[72px] min-w-[72px] rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[24px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {avatar}
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-1">{dictionary.blogPost.writtenBy}</div>
              <div className="text-[22px] font-medium text-[var(--charcoal)] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                {post.author.name}
              </div>
              <div className="text-[12.5px] text-[var(--text-light)] mb-2.5">{post.author.role}</div>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{post.author.bio}</p>
            </div>
          </div>
        )}

        <CommentSection postId={post.id} />
      </article>

      {related.length > 0 && (
        <section className="py-14 bg-[var(--bg-warm)]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">{dictionary.blogPost.keepReading}</div>
            <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {dictionary.blogPost.relatedArticles}
            </h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {related.map((relatedPost) => (
                <Link key={relatedPost.id} href={localizePathname(`/blog/${relatedPost.slug}`, locale)} className="no-underline group">
                  <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "16/10" }}>
                    <Image
                      src={relatedPost.img}
                      alt={relatedPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="text-[19px] font-medium leading-tight mb-2 group-hover:text-[var(--gold-dark)] text-[var(--charcoal)] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                    {relatedPost.title}
                  </h3>
                  <div className="text-[12px] text-[var(--text-light)]">
                    {relatedPost.date} &middot; {relatedPost.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </BlogPostClient>
  );
}
