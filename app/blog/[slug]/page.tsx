import { client, urlFor } from "@/sanity/client";
import { postBySlugQuery, allPostSlugsQuery } from "@/sanity/queries";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(allPostSlugsQuery);
  return (slugs || []).map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(postBySlugQuery, { slug });
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatImage(img: any, w = 1400) {
  if (!img?.asset) return "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80";
  return urlFor(img).width(w).quality(80).url();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// PortableText custom components
const ptComponents = {
  types: {
    image: ({ value }: any) => (
      <figure className="my-9 -mx-4 md:-mx-16 text-center">
        <img src={urlFor(value).width(1200).quality(80).url()} alt={value.alt || ""} className="w-full object-cover" style={{ maxHeight: 440 }} />
        {value.caption && <figcaption className="text-[12px] text-[var(--text-light)] mt-2.5 italic">{value.caption}</figcaption>}
      </figure>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-[22px] font-medium text-[var(--charcoal)] mt-8 mb-4" style={{ fontFamily: "var(--font-display)" }}>{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-10 py-6 pl-7 border-l-[3px] border-[var(--gold)] text-[24px] font-normal italic text-[var(--charcoal)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{children}</blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold text-[var(--charcoal)]">{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => <a href={value?.href} className="text-[var(--gold)] underline" target="_blank" rel="noopener">{children}</a>,
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) notFound();

  const avatar = (post.author?.name || "C").split(" ").map((w: string) => w[0]).join("");
  const heroImg = formatImage(post.coverImage);
  const catName = post.categories?.[0]?.name || "Article";

  const relatedPosts = (post.relatedPosts || []).map((p: any) => ({
    id: p._id,
    title: p.title,
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    img: formatImage(p.coverImage, 600),
    slug: p.slug?.current || "",
    cat: p.categories?.[0]?.name || "Article",
  }));

  const tags = (post.tags || []).map((t: any) => t.name);

  return (
    <BlogPostClient>
      {/* Hero */}
      <section className="pt-14">
        <div className="relative overflow-hidden" style={{ height: "60vh", minHeight: 400, maxHeight: 560 }}>
          <img src={heroImg} alt={post.title} className="w-full h-full object-cover" />
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

      {/* Article Body — Sanity PortableText */}
      <article className="max-w-[720px] mx-auto px-6 pt-10">
        <div className="article-body">
          <PortableText value={post.body || []} components={ptComponents} />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 pt-7 border-t border-[var(--border)] flex items-center gap-2 flex-wrap mb-6">
            <span className="text-[12px] text-[var(--text-light)] mr-1">Tags:</span>
            {tags.map((tag: string) => (
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
      {relatedPosts.length > 0 && (
        <section className="py-14 bg-[var(--bg-warm)]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Keep Reading</div>
            <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Related Articles</h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {relatedPosts.map((rp: any) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="no-underline group">
                  <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "16/10" }}>
                    <img src={rp.img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
