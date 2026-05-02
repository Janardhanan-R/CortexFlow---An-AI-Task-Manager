export function CriticalPath({ criticalTasks, bottlenecks, selectedTaskId, onSelectTask }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <h2 className="mb-2 text-sm font-semibold text-slate-800">4. Critical path</h2>
      <p className="mb-4 rounded-lg border border-red-100 bg-red-50/80 p-3 text-xs leading-relaxed text-red-900">
        These tasks sit on the <strong>longest dependency chain</strong> by duration — they{" "}
        <strong>determine total project duration</strong>. Delays here push the finish date; other tasks may
        have slack if they run off this chain.
      </p>
      {!criticalTasks.length ? (
        <p className="text-xs text-slate-500">No critical path yet.</p>
      ) : (
        <div className="space-y-4">
          <ol className="space-y-2">
            {criticalTasks.map((t, i) => (
              <li
                key={t.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:scale-[1.01] ${
                  selectedTaskId === t.id
                    ? "border-red-400 bg-red-100 text-red-950 ring-2 ring-red-300"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
                onClick={() => onSelectTask?.(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTask?.(t.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-900">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-red-700/80">{t.id}</p>
                </div>
              </li>
            ))}
          </ol>
          {bottlenecks?.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                Bottlenecks
              </p>
              <p className="mt-1 text-xs text-amber-900">
                {bottlenecks.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
