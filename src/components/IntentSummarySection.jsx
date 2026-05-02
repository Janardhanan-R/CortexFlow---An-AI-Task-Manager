import { buildIntentView } from "../lib/dashboardView";

export function IntentSummarySection({ planData, totalHours, projectedDuration }) {
  const { goal, keywords } = buildIntentView(planData);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900/90">
      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
        Intent summary
      </p>
      <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 dark:text-slate-50">
        Project goal
      </h2>
      <p className="mt-2 text-base leading-relaxed text-slate-800 dark:text-slate-200">{goal || "—"}</p>

      {keywords?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
        <p className="text-slate-700">
          <span className="font-semibold text-slate-900">Total task time</span>
          <span className="ml-2 font-mono font-semibold tabular-nums">
            {totalHours ?? 0}h
          </span>
        </p>
        <p className="text-slate-700">
          <span className="font-semibold text-slate-900">Projected duration (CPM)</span>
          <span className="ml-2 font-mono font-semibold tabular-nums">
            {projectedDuration ?? 0}h
          </span>
        </p>
      </div>
    </section>
  );
}
