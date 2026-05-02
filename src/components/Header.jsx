import { btnSecondary } from "../lib/buttonClasses.js";
import { useTheme } from "../context/ThemeContext.jsx";

export function Header({ onMenuToggle, menuOpen, onRunDemo }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="relative z-10 w-full shrink-0 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          className={`${btnSecondary} md:hidden`}
          onClick={onMenuToggle}
        >
          {menuOpen ? "Hide" : "Menu"}
        </button>
        <div className="flex min-w-0 flex-1 items-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            CortexFlow
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRunDemo}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-900 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100 dark:hover:bg-violet-900/80"
          >
            Run demo
          </button>
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
