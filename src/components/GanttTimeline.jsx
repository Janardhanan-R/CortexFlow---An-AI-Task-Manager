export function GanttTimeline({ rows }) {
  if (!rows.length) return null;
  const maxHours = Math.max(...rows.map((r) => r.hours), 1);

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Visual timeline
      </p>
      <div className="space-y-2.5">
        {rows.map((row) => {
          const pct = Math.min(100, Math.round((row.hours / maxHours) * 100));
          return (
            <div key={row.task.id} className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(120px,2fr)] sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-800">{row.task.name}</p>
                <p className="text-[10px] text-slate-500">{row.hours}h</p>
              </div>
              <div className="h-6 overflow-hidden rounded-lg bg-slate-200/80">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
                  style={{ width: `${pct}%`, minWidth: pct > 0 ? "8px" : 0 }}
                  title={`${row.task.name}: ${row.hours}h`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
