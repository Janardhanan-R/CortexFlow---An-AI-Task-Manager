function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-full max-w-md rounded bg-slate-200" />
      <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
    </div>
  );
}

export function WorkflowLoadingSkeleton() {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-center sm:text-left">
        <p className="text-sm font-semibold text-indigo-900">Analyzing input…</p>
        <p className="mt-1 text-xs text-indigo-700">Generating workflow — building your structured plan.</p>
      </div>

      <SkeletonCard />
      <SkeletonCard />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard className="min-h-[140px]" />
        <SkeletonCard className="min-h-[140px]" />
        <SkeletonCard className="min-h-[140px]" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />

      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
        <div className="h-24 w-full max-w-md animate-pulse rounded-xl bg-slate-100" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
