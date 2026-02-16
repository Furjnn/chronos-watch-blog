// ═══ BrandStrip ═══
export function BrandStrip({ brands }: { brands: string[] }) {
  return (
    <section className="bg-[var(--bg)] border-b border-[var(--border-light)] py-5 overflow-hidden">
      <div className="flex w-max" style={{ animation: "marquee 35s linear infinite" }}>
        {[...brands, ...brands].map((b, i) => (
          <span
            key={i}
            className="text-[11px] font-medium tracking-[3.5px] text-[var(--border)] whitespace-nowrap px-8 hover:text-[var(--gold)] transition-colors cursor-pointer"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
