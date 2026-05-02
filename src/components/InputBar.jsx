import { btnPrimary } from "../lib/buttonClasses.js";

export function InputBar({
  input,
  onInputChange,
  loading,
  onGenerate,
  error,
  inputAnalysis,
}) {
  const showPreview =
    inputAnalysis &&
    (input.trim().length > 0 || (inputAnalysis.detectedFeatures?.length ?? 0) > 0);

  function handleKeyDown(e) {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (!loading) onGenerate();
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-slate-200/70 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex w-full flex-col gap-2">
        {showPreview && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-3 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900">
              Smart input (preview)
            </p>
            {inputAnalysis.promptCount > 1 && (
              <p className="mt-1 text-xs text-emerald-800">
                Multiple prompts detected: <strong>{inputAnalysis.promptCount}</strong> segments (normalized before
                planning).
              </p>
            )}
            <p className="mt-2 text-xs font-medium text-emerald-900">Detected features</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {inputAnalysis.detectedFeatures.length ? (
                inputAnalysis.detectedFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-emerald-900 shadow-sm ring-1 ring-emerald-200"
                  >
                    <span className="text-emerald-600">✔</span> {f}
                  </li>
                ))
              ) : (
                <li className="text-xs text-emerald-700/80">Type more — we’ll match features like Login, Payment…</li>
              )}
            </ul>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/90 px-3 py-2 dark:border-indigo-900 dark:bg-indigo-950/50">
            <span
              className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-300"
              aria-hidden
            />
            <span className="text-xs font-medium text-indigo-900 dark:text-indigo-100">Generating workflow…</span>
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <textarea
            rows={2}
            className="min-h-[3.25rem] flex-1 resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950"
            placeholder="Describe your project idea… (Enter to generate, Shift+Enter for new line)"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="button"
            className={`${btnPrimary} shrink-0`}
            disabled={loading}
            onClick={() => onGenerate()}
          >
            {loading ? "Planning…" : "Generate"}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">Enter submits · Shift+Enter new line</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </footer>
  );
}
