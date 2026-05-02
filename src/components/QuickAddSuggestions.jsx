const QUICK_CHIPS = [
  { label: "Login", text: " Add secure login and session handling." },
  { label: "Payment", text: " Add payment and subscription billing." },
  { label: "Dashboard", text: " Add an analytics dashboard with charts." },
];

/**
 * Appends suggestion text to the bottom input when a chip is clicked.
 * Single instance — lives in the Planning tab for clearer UX vs. the fixed input bar.
 */
export function QuickAddSuggestions({ onAppend }) {
  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Quick suggestions</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onAppend?.(c.text)}
            className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Add {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
