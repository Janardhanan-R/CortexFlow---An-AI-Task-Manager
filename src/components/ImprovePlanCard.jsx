import { btnAccent } from "../lib/buttonClasses.js";

export function ImprovePlanCard({ text, loading, error, onImprove, disabled }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/80 p-4 shadow-sm dark:border-violet-900 dark:bg-violet-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-violet-900 dark:text-violet-100">AI plan improvements</h2>
        <button type="button" onClick={onImprove} disabled={disabled || loading} className={btnAccent}>
          {loading ? "Analyzing…" : "Improve plan"}
        </button>
      </div>
      <p className="mt-1 text-xs text-violet-900/80 dark:text-violet-200/80">
        Suggests missing tasks, ordering tweaks, and quick wins (Gemini).
      </p>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {text && (
        <div className="mt-3 whitespace-pre-wrap rounded-lg border border-violet-100 bg-white/90 p-3 text-sm text-slate-800 dark:border-violet-900 dark:bg-slate-900/60 dark:text-slate-100">
          {text}
        </div>
      )}
    </section>
  );
}
