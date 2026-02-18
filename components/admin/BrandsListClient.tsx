"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";

const segStyle: Record<string, { bg: string; text: string }> = {
  ENTRY: { bg: "bg-blue-50", text: "text-blue-700" },
  MID_RANGE: { bg: "bg-teal-50", text: "text-teal-700" },
  LUXURY: { bg: "bg-amber-50", text: "text-amber-700" },
  ULTRA_LUXURY: { bg: "bg-purple-50", text: "text-purple-700" },
};
const segLabel: Record<string, string> = { ENTRY: "Entry", MID_RANGE: "Mid-Range", LUXURY: "Luxury", ULTRA_LUXURY: "Ultra-Luxury" };

interface BrandListItem {
  id: string;
  name: string;
  logo: string | null;
  country: string;
  founded: number | null;
  priceSegment: string;
  _count: {
    posts: number;
    reviews: number;
  };
}

export default function BrandsListClient({ brands }: { brands: BrandListItem[] }) {
  const router = useRouter();
  const remove = async (id: string, n: string) => { if (!confirm(`Delete "${n}" and all associated content?`)) return; await fetch(`/api/admin/brands/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Brands</h1>
          <p className="text-[13px] text-slate-400 mt-1">{brands.length} brands in your directory</p>
        </div>
        <Link href="/admin/brands/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Brand
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Brand</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-32">Country</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-32">Segment</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-24">Founded</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Content</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map(b => {
              const seg = segStyle[b.priceSegment] || segStyle.LUXURY;
              return (
                <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/brands/${b.id}/edit`} className="no-underline">
                      <div className="flex items-center gap-3">
                        {b.logo ? <img src={b.logo} alt="" className="w-8 h-8 object-contain rounded bg-slate-50 p-1" /> : <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-400">{b.name[0]}</div>}
                        <span className="text-[14px] font-medium text-slate-800 group-hover:text-[#B8956A] transition-colors">{b.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500">{b.country}</td>
                  <td className="px-4 py-4"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${seg.bg} ${seg.text}`}>{segLabel[b.priceSegment]}</span></td>
                  <td className="px-4 py-4 text-[13px] text-slate-400 tabular-nums">{b.founded || "—"}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3 text-[12px] text-slate-400">
                      <span>{b._count.posts} posts</span>
                      <span>{b._count.reviews} reviews</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/brands/${b.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#B8956A] no-underline transition-colors" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <button onClick={() => remove(b.id, b.name)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
