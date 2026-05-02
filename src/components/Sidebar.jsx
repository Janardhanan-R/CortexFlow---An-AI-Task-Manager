import { btnSecondary } from "../lib/buttonClasses.js";

export function Sidebar({ history, onSelectPrompt, collapsed, onClose }) {
  return (
    <aside
      className={`${
        collapsed ? "hidden md:flex" : "flex"
      } max-h-[min(50vh,22rem)] w-full min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-gray-900 md:max-h-[calc(100dvh-3.5rem)] md:w-64 md:self-stretch`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Prompt History</p>
        <button
          type="button"
          className={`${btnSecondary} md:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable]">
        {history.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300">No prompts yet.</p>
        ) : (
          history.map((entry, idx) => (
            <button
              type="button"
              key={`${entry}-${idx}`}
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium leading-snug text-slate-800 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-100 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:focus-visible:ring-indigo-400/40"
              onClick={() => onSelectPrompt(entry)}
            >
              {entry}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
