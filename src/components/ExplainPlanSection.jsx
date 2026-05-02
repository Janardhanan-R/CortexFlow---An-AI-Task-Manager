import { btnSmall } from "../lib/buttonClasses.js";

export function ExplainPlanSection({ loading, text, error, onClear }) {
  const hasContent = Boolean(text?.trim() || error);

  return (
    <section
      className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
      aria-live="polite"
      aria-busy={loading}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Explanation</h2>
        {hasContent && !loading && (
          <button type="button" onClick={onClear} className={`${btnSmall} text-slate-600`}>
            Clear
          </button>
        )}
      </div>
      <div className="min-h-[3rem] text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {loading && (
          <p className="animate-pulse text-slate-500 dark:text-slate-400">
            AI is analyzing and explaining the workflow…
          </p>
        )}
        {!loading && error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && text?.trim() && (
          <div className="whitespace-pre-line rounded-lg border border-slate-100 bg-white p-3 text-slate-800 shadow-inner dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100">
            {text}
          </div>
        )}
        {!loading && !error && !text?.trim() && (
          <p className="text-slate-500 dark:text-slate-400">
            Use <span className="font-semibold text-slate-700 dark:text-slate-200">Explain plan</span> for a
            plain-language walkthrough of this workflow.
          </p>
        )}
      </div>
    </section>
  );
}
