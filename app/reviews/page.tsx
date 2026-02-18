import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Watch Reviews",
  description: "Hands-on reviews with detailed specs, ratings, and honest verdicts",
};

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { brand: true },
  });

  return (
    <div>
      <section className="pt-14 bg-[var(--navy)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-3">Expert Analysis</div>
          <h1 className="text-[48px] font-normal text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Watch Reviews</h1>
          <p className="text-[15px] text-white/50 max-w-[500px] mx-auto">Hands-on reviews with detailed specs, ratings, and honest verdicts</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-6" />
        </div>
      </section>

      <section className="py-12 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {reviews.length === 0 ? (
            <p className="text-center text-[var(--text-light)] py-20">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {reviews.map(r => {
                const gallery = (r.gallery as string[]) || [];
                const img = gallery[0] || fallbackImg;
                return (
                  <Link key={r.id} href={`/reviews/${r.slug}`} className="no-underline group">
                    <div className="overflow-hidden mb-3.5 bg-[var(--bg-off)]" style={{ aspectRatio: "4/3" }}>
                      <img src={img} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="text-[11px] font-medium text-[var(--gold)] tracking-[1px] uppercase mb-1">{r.brand?.name}</div>
                    <h3 className="text-[19px] font-medium text-[var(--charcoal)] leading-tight mb-2 group-hover:text-[var(--gold-dark)] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{r.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[22px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{r.rating}</span>
                        <span className="text-[12px] text-[var(--text-light)]">/10</span>
                      </div>
                      {r.priceMin && <span className="text-[14px] font-semibold text-[var(--charcoal)]">${r.priceMin.toLocaleString()}+</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
