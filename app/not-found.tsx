import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";

export default async function NotFound() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <section className="pt-14 min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-10 max-w-[560px]">
        <div className="relative w-[140px] h-[140px] mx-auto mb-8 rounded-full border-2 border-[var(--border)]">
          <div className="absolute inset-2 rounded-full border border-[var(--border)] flex items-center justify-center">
            <span className="text-5xl font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>
              404
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-normal text-[var(--charcoal)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {dictionary.notFound.title}
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-8">{dictionary.notFound.description}</p>

        <div className="flex gap-3 justify-center mb-10">
          <Link href={localizePathname("/", locale)} className="px-8 py-3.5 bg-[var(--charcoal)] text-white text-[12px] font-semibold tracking-[1.5px] uppercase no-underline">
            {dictionary.notFound.backHome}
          </Link>
          <Link
            href={localizePathname("/blog", locale)}
            className="px-8 py-3.5 bg-transparent border border-[var(--border)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1.5px] uppercase no-underline hover:border-[var(--charcoal)] transition-colors"
          >
            {dictionary.notFound.browseArticles}
          </Link>
        </div>
      </div>
    </section>
  );
}
