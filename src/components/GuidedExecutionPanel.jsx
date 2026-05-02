import { useMemo } from "react";
import { getFirstReadyTaskId } from "../lib/taskNavigation";
import { PriorityBadge } from "./PriorityBadge.jsx";
import { btnAccent, btnSecondary } from "../lib/buttonClasses.js";

export function GuidedExecutionPanel({
  tasks,
  completedIds,
  executionActive,
  onStart,
  onExit,
  onMarkCurrentComplete,
}) {
  const currentId = useMemo(
    () => getFirstReadyTaskId(tasks, completedIds),
    [tasks, completedIds],
  );

  const current = useMemo(
    () => tasks.find((t) => t.id === currentId) || null,
    [tasks, currentId],
  );

  const completedSet =
    completedIds instanceof Set ? completedIds : new Set(completedIds || []);
  const total = tasks.length;
  const done = completedSet.size;
  const allDone = total > 0 && done >= total;

  if (!tasks.length) return null;

  return (
    <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-white p-4 shadow-md dark:border-indigo-800 dark:from-indigo-950/50 dark:to-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
            Guided execution
          </h2>
          <p className="text-xs text-indigo-800/90 dark:text-indigo-200/90">
            One focus task at a time. Complete prerequisites automatically unlock the next step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!executionActive ? (
            <button type="button" onClick={onStart} className={btnAccent}>
              Start workflow
            </button>
          ) : (
            <button type="button" onClick={onExit} className={btnSecondary}>
              Exit guided mode
            </button>
          )}
        </div>
      </div>

      {executionActive && (
        <div className="mt-4 rounded-xl border border-white/80 bg-white/90 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
          {allDone ? (
            <p className="text-center text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              All tasks complete — nice work.
            </p>
          ) : current ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Current task
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">{current.name}</p>
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{current.id}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Est. <strong>{current.estimated_time_hours}h</strong>
                </span>
                <PriorityBadge priority={current.priority} />
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Depends on: </span>
                {(current.depends_on || []).length
                  ? current.depends_on.join(", ")
                  : "None (can start immediately)"}
              </p>
              <button
                type="button"
                onClick={() => onMarkCurrentComplete(current.id)}
                className={`${btnAccent} mt-4 w-full sm:w-auto`}
              >
                Mark as completed
              </button>
            </>
          ) : (
            <p className="text-sm text-amber-800 dark:text-amber-200">
              No task is ready yet — complete upstream work or check off prerequisites in the checklist.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
