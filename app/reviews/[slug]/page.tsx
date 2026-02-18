import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewGallery from "./ReviewGallery";
import { renderTiptapContent } from "@/lib/tiptap-renderer";

export const revalidate = 3600;

export async function generateStaticParams() {
  const reviews = await prisma.review.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return reviews.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await prisma.review.findUnique({ where: { slug }, select: { title: true, verdict: true, seoTitle: true, seoDesc: true } });
  if (!review) return { title: "Not Found" };
  return { title: review.seoTitle || `${review.title} Review`, description: review.seoDesc || review.verdict };
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await prisma.review.findUnique({
    where: { slug },
    include: { brand: true, author: true },
  });

  if (!review || review.status !== "PUBLISHED") notFound();

  const gallery = (review.gallery as string[]) || [];
  const specs = (review.specs as Record<string, string>) || {};
  const prosAndCons = (review.prosAndCons as { pros?: string[]; cons?: string[] }) || {};
  const specRows = Object.entries(specs).filter(([_, v]) => v).map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
    return [label, v];
  });

  const bodyContent = review.body ? renderTiptapContent(review.body as any) : null;

  return (
    <div>
      <section className="pt-14 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8">
          <div className="text-[12px] text-[var(--text-light)] mb-6">
            <Link href="/" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Home</Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <Link href="/reviews" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Reviews</Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span className="text-[var(--text)]">{review.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-[var(--border)]">
            <ReviewGallery images={gallery} />
            <div>
              <div className="text-[12px] font-medium text-[var(--gold)] tracking-[1.5px] uppercase mb-1.5">{review.brand?.name}</div>
              <h1 className="text-[36px] font-normal text-[var(--charcoal)] leading-[1.15] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{review.title}</h1>
              {review.watchRef && <p className="text-[14px] text-[var(--text-secondary)] mb-5">Ref. {review.watchRef}</p>}

              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border)]">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill={n <= Math.round(review.rating / 2) ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  ))}
                </div>
                <span className="text-[28px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{review.rating}</span>
                <span className="text-[13px] text-[var(--text-light)]">/10</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { l: "Case Size", v: specs.caseSize },
                  { l: "Movement", v: specs.movement },
                  { l: "Water Resist.", v: specs.waterResistance },
                  { l: "Power Reserve", v: specs.powerReserve },
                ].filter(s => s.v).map(s => (
                  <div key={s.l} className="p-3.5 bg-[var(--bg-off)] border border-[var(--border)]">
                    <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[var(--text-light)] mb-1">{s.l}</div>
                    <div className="text-[18px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {(review.priceMin || review.priceMax) && (
                <div className="mb-5">
                  <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[var(--text-light)] mb-1">Price Range</div>
                  <div className="text-[28px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                    {review.priceMin ? `$${review.priceMin.toLocaleString()}` : ""}{review.priceMin && review.priceMax ? " — " : ""}{review.priceMax ? `$${review.priceMax.toLocaleString()}` : ""}
                  </div>
                </div>
              )}

              <button className="w-full py-3.5 bg-[var(--gold)] border-none text-white text-[12px] font-bold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold-light)] transition-colors">Check Availability</button>
            </div>
          </div>
        </div>
      </section>

      {review.verdict && (
        <section className="bg-[var(--bg-warm)] py-9 border-b border-[rgba(184,149,106,0.15)]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Editor&apos;s Verdict</div>
            <p className="text-[20px] font-normal italic text-[var(--charcoal)] leading-snug max-w-[800px]" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{review.verdict}&rdquo;</p>
            <span className="text-[12px] text-[var(--text-light)] mt-2 block">— {review.author?.name}{review.author?.role ? `, ${review.author.role}` : ""}</span>
          </div>
        </section>
      )}

      {prosAndCons && (prosAndCons.pros?.length || prosAndCons.cons?.length) ? (
        <section className="py-12 bg-[var(--bg)]">
          <div className="max-w-[800px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {prosAndCons.pros && prosAndCons.pros.length > 0 && (
              <div className="p-7 border border-[rgba(45,106,79,0.2)] bg-[rgba(45,106,79,0.02)]">
                <div className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--green)] mb-4">Pros</div>
                {prosAndCons.pros.map(p => (
                  <div key={p} className="flex gap-2.5 items-start mb-3">
                    <svg className="mt-0.5 min-w-[14px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                    <span className="text-[13.5px] text-[var(--text)] leading-snug">{p}</span>
                  </div>
                ))}
              </div>
            )}
            {prosAndCons.cons && prosAndCons.cons.length > 0 && (
              <div className="p-7 border border-[rgba(185,28,28,0.15)] bg-[rgba(185,28,28,0.02)]">
                <div className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--red)] mb-4">Cons</div>
                {prosAndCons.cons.map(c => (
                  <div key={c} className="flex gap-2.5 items-start mb-3">
                    <svg className="mt-0.5 min-w-[14px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span className="text-[13.5px] text-[var(--text)] leading-snug">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Review Body */}
      {bodyContent && (
        <section className="py-12 bg-[var(--bg)]">
          <article className="max-w-[720px] mx-auto px-6">
            <div className="article-body">{bodyContent}</div>
          </article>
        </section>
      )}

      {specRows.length > 0 && (
        <section className="py-12 bg-[var(--bg-off)]">
          <div className="max-w-[800px] mx-auto px-6 md:px-10">
            <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Technical</div>
            <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Full Specifications</h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mb-7" />
            <div className="border border-[var(--border)] overflow-hidden bg-[var(--bg)]">
              {specRows.map(([label, val], i) => (
                <div key={label} className="flex" style={{ borderBottom: i < specRows.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="flex-[0_0_200px] px-4 py-3 bg-[var(--bg-off)] text-[13px] font-semibold text-[var(--charcoal)]">{label}</div>
                  <div className="flex-1 px-4 py-3 text-[13px] text-[var(--text-secondary)]">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
