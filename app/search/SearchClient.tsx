"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";

type ResultType = "article" | "review" | "brand";
type FilterType = "all" | ResultType;
type SortType = "relevance" | "recent";

interface Result {
  id: string;
  type: ResultType;
  title: string;
  excerpt: string;
  date: string;
  sortDate: number;
  readTime: string;
  img: string;
  slug: string;
  category?: string;
  brand?: string;
  score: number;
}

interface FacetItem {
  value: string;
  count: number;
}

interface SearchFilters {
  type: FilterType;
  sort: SortType;
  category: string;
  brand: string;
}

interface SearchFacets {
  types: {
    article: number;
    review: number;
    brand: number;
  };
  categories: FacetItem[];
  brands: FacetItem[];
}

const typeColor: Record<ResultType, string> = {
  article: "var(--charcoal)",
  review: "#2D6A4F",
  brand: "var(--gold)",
};

function getTypeLabel(type: ResultType, t: (path: string, fallback?: string) => string) {
  if (type === "article") return t("search.typeArticle", "Article");
  if (type === "review") return t("search.typeReview", "Review");
  return t("search.typeBrand", "Brand");
}

function buildSearchUrl(filters: SearchFilters, query: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function SearchClient({
  initialResults,
  initialQuery,
  initialFilters,
  facets,
}: {
  initialResults: Result[];
  initialQuery: string;
  initialFilters: SearchFilters;
  facets: SearchFacets;
}) {
  const { t, localizePath } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const activeTypeCounts = useMemo(
    () => ({
      all: initialResults.length,
      article: facets.types.article,
      review: facets.types.review,
      brand: facets.types.brand,
    }),
    [facets.types.article, facets.types.brand, facets.types.review, initialResults.length],
  );

  const submit = (nextFilters = filters, nextQuery = query) => {
    router.push(localizePath(buildSearchUrl(nextFilters, nextQuery)));
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    submit();
  };

  const setTypeFilter = (type: FilterType) => {
    const next = { ...filters, type };
    setFilters(next);
    submit(next, query);
  };

  const updateFilter = (patch: Partial<SearchFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    submit(next, query);
  };

  const clearOptionalFilters = () => {
    const next = {
      ...filters,
      type: "all" as FilterType,
      category: "",
      brand: "",
      sort: "relevance" as SortType,
    };
    setFilters(next);
    submit(next, query);
  };

  return (
    <div className="pt-14 min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--bg-warm)] border-b border-[var(--border)]">
        <div className="max-w-[980px] mx-auto px-6 md:px-10 pt-10 pb-9">
          <form onSubmit={onSearch} className="flex items-center gap-3.5 px-5 py-3.5 border-2 border-[var(--charcoal)] bg-[var(--bg)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder", "Search articles, reviews, brands...")}
              className="flex-1 border-none outline-none bg-transparent text-[16px] text-[var(--text)]"
            />
            <button type="submit" className="text-[11px] font-bold tracking-[1.5px] uppercase px-4 py-2 bg-[var(--charcoal)] text-white border-none cursor-pointer">
              {t("search.button", "Search")}
            </button>
          </form>

          {initialQuery && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-[var(--text-secondary)]">
                <strong className="text-[var(--charcoal)]">{initialResults.length} {t("search.resultsFor", "results for")}</strong> &ldquo;{initialQuery}&rdquo;
              </span>
              {(filters.type !== "all" || filters.category || filters.brand || filters.sort !== "relevance") && (
                <button
                  onClick={clearOptionalFilters}
                  className="text-[11px] font-semibold uppercase tracking-[0.8px] border border-[var(--border)] bg-white px-2.5 py-1 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--charcoal)]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {initialQuery && (
            <div className="mt-5 flex flex-wrap gap-2">
              {([
                { id: "all", label: t("search.all", "All") },
                { id: "article", label: t("search.typeArticle", "Article") },
                { id: "review", label: t("search.typeReview", "Review") },
                { id: "brand", label: t("search.typeBrand", "Brand") },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTypeFilter(item.id)}
                  className={`text-[11px] font-semibold uppercase tracking-[0.8px] px-3 py-1.5 border cursor-pointer transition-colors ${
                    filters.type === item.id
                      ? "bg-[var(--charcoal)] text-white border-[var(--charcoal)]"
                      : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--charcoal)]"
                  }`}
                >
                  {item.label} ({activeTypeCounts[item.id]})
                </button>
              ))}
            </div>
          )}

          {initialQuery && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={filters.sort}
                onChange={(event) => updateFilter({ sort: event.target.value as SortType })}
                className="px-3 py-2 border border-[var(--border)] bg-white text-[13px] text-[var(--text-secondary)]"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="recent">Sort: Most Recent</option>
              </select>

              <select
                value={filters.category}
                onChange={(event) => updateFilter({ category: event.target.value })}
                className="px-3 py-2 border border-[var(--border)] bg-white text-[13px] text-[var(--text-secondary)]"
              >
                <option value="">All categories</option>
                {facets.categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>

              <select
                value={filters.brand}
                onChange={(event) => updateFilter({ brand: event.target.value })}
                className="px-3 py-2 border border-[var(--border)] bg-white text-[13px] text-[var(--text-secondary)]"
              >
                <option value="">All brands</option>
                {facets.brands.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[980px] mx-auto px-6 md:px-10 py-6 pb-16">
        {!initialQuery ? (
          <p className="text-center text-[var(--text-light)] py-20">{t("search.enterQuery", "Enter a search query to find articles, reviews, and brands.")}</p>
        ) : initialResults.length === 0 ? (
          <p className="text-center text-[var(--text-light)] py-20">
            {t("search.noResults", "No results found for")} &ldquo;{initialQuery}&rdquo;. {t("search.noResultsTail", "Try a different search term.")}
          </p>
        ) : (
          initialResults.map((result, index) => (
            <Link
              key={result.id}
              href={localizePath(result.slug)}
              className="flex gap-5 py-6 no-underline"
              style={{ borderBottom: index < initialResults.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={() => setHoveredId(result.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative w-[120px] h-[90px] min-w-[120px] overflow-hidden bg-[var(--bg-off)]">
                <Image
                  src={result.img}
                  alt={result.title}
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-500"
                  style={{ transform: hoveredId === result.id ? "scale(1.06)" : "scale(1)" }}
                />
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2 py-0.5 text-white"
                    style={{ background: typeColor[result.type] || "var(--text-secondary)" }}
                  >
                    {getTypeLabel(result.type, t)}
                  </span>
                  {result.category && <span className="text-[10px] text-[var(--text-light)]">{result.category}</span>}
                  {result.brand && <span className="text-[10px] text-[var(--text-light)]">{result.brand}</span>}
                </div>
                <h3 className="text-[19px] font-medium leading-tight mb-1.5 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === result.id ? "var(--gold-dark)" : "var(--charcoal)" }}>
                  {result.title}
                </h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-snug mb-2 line-clamp-2">{result.excerpt}</p>
                <div className="text-[11.5px] text-[var(--text-light)]">
                  {result.date}
                  {result.readTime && ` - ${result.readTime}`}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
