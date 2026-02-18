export default function GlobalLoading() {
  return (
    <div className="pt-14 min-h-screen bg-[var(--bg)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 animate-pulse">
        <div className="h-7 w-56 bg-[var(--bg-off)] mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-[var(--bg-off)]" />
          <div className="h-64 bg-[var(--bg-off)]" />
          <div className="h-64 bg-[var(--bg-off)]" />
        </div>
      </div>
    </div>
  );
}
