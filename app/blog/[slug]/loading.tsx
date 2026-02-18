export default function BlogPostLoading() {
  return (
    <div className="pt-14 bg-[var(--bg)] min-h-screen animate-pulse">
      <div className="h-[50vh] bg-[var(--bg-off)]" />
      <div className="max-w-[720px] mx-auto px-6 py-10">
        <div className="h-9 w-3/4 bg-[var(--bg-off)] mb-4" />
        <div className="h-5 w-full bg-[var(--bg-off)] mb-3" />
        <div className="h-5 w-5/6 bg-[var(--bg-off)] mb-10" />
        <div className="h-5 w-full bg-[var(--bg-off)] mb-3" />
        <div className="h-5 w-full bg-[var(--bg-off)] mb-3" />
        <div className="h-5 w-4/5 bg-[var(--bg-off)]" />
      </div>
    </div>
  );
}
