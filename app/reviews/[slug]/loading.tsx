export default function ReviewLoading() {
  return (
    <div className="pt-14 bg-[var(--bg)] min-h-screen animate-pulse">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[520px] bg-[var(--bg-off)]" />
          <div className="space-y-4">
            <div className="h-7 w-40 bg-[var(--bg-off)]" />
            <div className="h-12 w-3/4 bg-[var(--bg-off)]" />
            <div className="h-5 w-2/3 bg-[var(--bg-off)]" />
            <div className="h-20 w-full bg-[var(--bg-off)] mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
