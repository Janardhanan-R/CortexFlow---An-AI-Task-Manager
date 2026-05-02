export function RiskPanel({ risks }) {
  if (!risks?.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Risk signals</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No major keyword risks detected.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/30">
      <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Risk signals</h2>
      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
        Heuristic scan (integrations, security, bottlenecks) — not a substitute for team review.
      </p>
      <ul className="mt-3 space-y-2">
        {risks.map((r, i) => (
          <li
            key={`${r.title}-${i}`}
            className="rounded-lg border border-amber-100 bg-white/90 p-3 text-sm dark:border-amber-900 dark:bg-slate-900/50"
          >
            <p className="font-semibold text-amber-950 dark:text-amber-100">
              {r.level === "high" ? "⚠️ " : "◆ "}
              {r.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{r.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
