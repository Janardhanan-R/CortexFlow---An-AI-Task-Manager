export function StorySummary({
  projectGoal,
  totalHours,
  criticalPathNames,
  taskCount,
  parallelTaskCount,
  projectedDuration,
}) {
  const criticalReadable =
    criticalPathNames?.length > 0 ? criticalPathNames.join(" → ") : "—";

  return (
    <section className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-white p-4 shadow-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-slate-900">Story summary</h2>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
          At a glance
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-lg leading-none">⏱️</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Total estimated time
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{totalHours ?? 0}h</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-lg leading-none">📈</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Projected duration (CPM)
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{projectedDuration ?? 0}h</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-lg leading-none">🧩</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Tasks
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{taskCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-lg leading-none">⚡</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Parallel tasks (wave)
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{parallelTaskCount ?? 0}</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">🎯 Project goal</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">
          {projectGoal || "—"}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-red-800">🔴 Critical path</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-red-950">{criticalReadable}</p>
      </div>
    </section>
  );
}
