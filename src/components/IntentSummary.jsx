export function IntentSummary({ intent }) {
  const { goal, keywords, features } = intent;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">2. Intent &amp; scope</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:bg-white">
          <p className="mb-2 text-lg">🎯</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Project goal
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {goal || "Generate a workflow to see your goal here."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:bg-white">
          <p className="mb-2 text-lg">🔑</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.length ? (
              keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                >
                  {k}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">—</span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:bg-white md:col-span-1">
          <p className="mb-2 text-lg">✨</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Features / scope
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-700">
            {features.length ? (
              features.map((f, i) => <li key={i}>{f}</li>)
            ) : (
              <li className="list-none text-slate-500">—</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
