import { btnBase } from "../lib/buttonClasses.js";
import { PriorityBadge } from "./PriorityBadge.jsx";

export function HTNPhases({ phases, selectedTaskId, onSelectTask }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">HTN phases</h2>
      <p className="mb-4 text-xs text-slate-500">
        Tasks grouped into Design, Development, and Testing by name heuristics (or your plan’s HTN structure).
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {phases.map((phase) => {
          const key = `${phase.id} ${phase.title}`.toLowerCase();
          const isDesign = key.includes("design");
          const isTest = key.includes("test") || key.includes("qa");
          const tone = isDesign
            ? "border-blue-200 bg-blue-50/90 ring-1 ring-blue-100"
            : isTest
              ? "border-amber-200 bg-amber-50/90 ring-1 ring-amber-100"
              : "border-emerald-200 bg-emerald-50/90 ring-1 ring-emerald-100";
          const titleTone = isDesign
            ? "text-blue-800"
            : isTest
              ? "text-amber-800"
              : "text-emerald-800";
          return (
          <div
            key={phase.id}
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone}`}
          >
            <p className={`text-xs font-bold uppercase tracking-wide ${titleTone}`}>
              {isDesign ? "🟦 " : isTest ? "🟨 " : "🟩 "}
              {phase.title}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {phase.tasks.length} task{phase.tasks.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-3 space-y-2">
              {phase.tasks.length === 0 ? (
                <li className="text-xs text-slate-400">No tasks in this bucket</li>
              ) : (
                phase.tasks.map((t) => (
                  <li
                    key={t.id}
                    className={`rounded-lg border bg-white p-2 text-xs transition-all duration-200 ${
                      selectedTaskId === t.id
                        ? "border-indigo-400 ring-1 ring-indigo-200"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <button
                      type="button"
                      className={`${btnBase} flex w-full items-start justify-between gap-2 rounded-lg text-left hover:bg-white/60`}
                      onClick={() => onSelectTask?.(t.id)}
                    >
                      <span className="font-medium text-slate-800">
                        <span className="text-slate-500">{t.id}</span> · {t.name}
                      </span>
                      <PriorityBadge priority={t.priority} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          );
        })}
      </div>
    </section>
  );
}
