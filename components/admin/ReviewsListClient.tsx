"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
  PUBLISHED: { bg: "bg-emerald-50", dot: "bg-emerald-500", text: "text-emerald-700" },
  DRAFT: { bg: "bg-amber-50", dot: "bg-amber-400", text: "text-amber-700" },
};

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

function RatingBar({ rating }: { rating: number }) {
  const pct = (rating / 10) * 100;
  const color = rating >= 8 ? "#10B981" : rating >= 6 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="text-[15px] font-semibold tabular-nums" style={{ color, fontFamily: "var(--font-display)" }}>{rating}</span>
    </div>
  );
}

interface ReviewListItem {
  id: string;
  title: string;
  watchRef: string;
  rating: number;
  status: string;
  isScheduled: boolean;
  scheduledAt: string | null;
  createdAt: string;
  brand: {
    name: string;
  } | null;
}

export default function ReviewsListClient({ reviews }: { reviews: ReviewListItem[] }) {
  const router = useRouter();
  const remove = async (id: string, t: string) => { if (!confirm(`Delete "${t}"?`)) return; await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Reviews</h1>
          <p className="text-[13px] text-slate-400 mt-1">{reviews.length} watch reviews</p>
        </div>
        <Link href="/admin/reviews/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Review
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Watch</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Brand</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-24">Ref.</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-32">Rating</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Status</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Date</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888"/></svg>
                <p className="text-[14px] text-slate-500 font-medium">No reviews yet</p>
                <Link href="/admin/reviews/new" className="text-[13px] text-[#B8956A] mt-1 inline-block">Create your first review →</Link>
              </td></tr>
            ) : reviews.map(r => {
              const st = statusStyles[r.status] || statusStyles.DRAFT;
              const scheduled = r.isScheduled;
              return (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/reviews/${r.id}/edit`} className="text-[14px] font-medium text-slate-800 no-underline group-hover:text-[#B8956A] transition-colors">{r.title}</Link>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500">{r.brand?.name}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-400 font-mono">{r.watchRef}</td>
                  <td className="px-4 py-4"><RatingBar rating={r.rating} /></td>
                  <td className="px-4 py-4">
                    {scheduled ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />SCHEDULED
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{r.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-400">
                    {scheduled && r.scheduledAt ? `Sched: ${formatDate(r.scheduledAt)}` : formatDate(r.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/reviews/${r.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#B8956A] no-underline transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <button onClick={() => remove(r.id, r.title)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">
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
