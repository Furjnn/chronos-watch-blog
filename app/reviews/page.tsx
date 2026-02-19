import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { localizePathname } from "@/lib/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import AdSlot from "@/components/ads/AdSlot";
import { ADSENSE_SLOTS } from "@/lib/ads";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alternates = getLocaleAlternates("/reviews", locale);

  return {
    title: dictionary.meta.reviewsTitle,
    description: dictionary.meta.reviewsDescription,
    alternates,
    openGraph: {
      title: `${dictionary.meta.reviewsTitle} | Chronos`,
      description: dictionary.meta.reviewsDescription,
      url: absoluteUrl(alternates.canonical),
      type: "website",
    },
  };
}

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";

export default async function ReviewsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const reviews = await prisma.review.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { brand: true },
  });

  return (
    <div>
      <section className="pt-14 bg-[var(--navy)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-3">{dictionary.reviews.badge}</div>
          <h1 className="text-[48px] font-normal text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {dictionary.reviews.title}
          </h1>
          <p className="text-[15px] text-white/50 max-w-[500px] mx-auto">{dictionary.reviews.subtitle}</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-6" />
        </div>
      </section>

      <section className="py-12 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <AdSlot slot={ADSENSE_SLOTS.reviewsListInline} />
          {reviews.length === 0 ? (
            <p className="text-center text-[var(--text-light)] py-20">{dictionary.reviews.noReviews}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {reviews.map((review) => {
                const gallery = (review.gallery as string[]) || [];
                const image = gallery[0] || fallbackImg;
                return (
                  <Link key={review.id} href={localizePathname(`/reviews/${review.slug}`, locale)} className="no-underline group">
                    <div className="relative overflow-hidden mb-3.5 bg-[var(--bg-off)]" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={image}
                        alt={review.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="text-[11px] font-medium text-[var(--gold)] tracking-[1px] uppercase mb-1">{review.brand?.name}</div>
                    <h3 className="text-[19px] font-medium text-[var(--charcoal)] leading-tight mb-2 group-hover:text-[var(--gold-dark)] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                      {review.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[22px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>
                          {review.rating}
                        </span>
                        <span className="text-[12px] text-[var(--text-light)]">/10</span>
                      </div>
                      {review.priceMin && (
                        <span className="text-[14px] font-semibold text-[var(--charcoal)]">${review.priceMin.toLocaleString()}+</span>
                      )}
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
