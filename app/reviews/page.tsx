import Link from "next/link";

const REVIEWS = [
  { id: "1", title: "Rolex Submariner 126610LN", brand: "Rolex", rating: 9.2, price: "$10,250", img: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&q=80", slug: "rolex-submariner" },
  { id: "2", title: "Tudor Black Bay 58", brand: "Tudor", rating: 8.8, price: "$3,975", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", slug: "tudor-bb58" },
  { id: "3", title: "Omega Seamaster 300M", brand: "Omega", rating: 9.0, price: "$5,300", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80", slug: "omega-seamaster" },
  { id: "4", title: "Grand Seiko SBGA413", brand: "Grand Seiko", rating: 9.3, price: "$5,800", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", slug: "grand-seiko-sbga413" },
  { id: "5", title: "Cartier Santos Medium", brand: "Cartier", rating: 8.9, price: "$7,250", img: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&q=80", slug: "cartier-santos" },
  { id: "6", title: "IWC Portugieser Chronograph", brand: "IWC", rating: 8.7, price: "$8,100", img: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80", slug: "iwc-portugieser" },
];

export default function ReviewsIndex() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {REVIEWS.map((r) => (
              <Link key={r.id} href={`/reviews/${r.slug}`} className="no-underline group">
                <div className="overflow-hidden mb-3.5 bg-[var(--bg-off)]" style={{ aspectRatio: "4/3" }}>
                  <img src={r.img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="text-[11px] font-medium text-[var(--gold)] tracking-[1px] uppercase mb-1">{r.brand}</div>
                <h3 className="text-[19px] font-medium text-[var(--charcoal)] leading-tight mb-2 group-hover:text-[var(--gold-dark)] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{r.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[22px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{r.rating}</span>
                    <span className="text-[12px] text-[var(--text-light)]">/10</span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--charcoal)]">{r.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
