import { Fragment, memo, useMemo } from "react";
import { buildFlowchartLevels } from "../lib/flowchartLevels";

function FlowLabel({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {children}
    </span>
  );
}

function FlowArrow() {
  return (
    <div
      className="flowchart-arrow flex h-9 shrink-0 items-center justify-center text-slate-400"
      aria-hidden
    >
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path
          className="flowchart-arrow-line"
          d="M14 4v22"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          className="flowchart-arrow-head"
          d="M8 22l6 8 6-8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

const FlowchartNode = memo(function FlowchartNode({
  task,
  isCritical,
  isSelected,
  isDone,
  onSelect,
}) {
  const hours = task.estimated_time_hours ?? "—";
  const deps =
    Array.isArray(task.depends_on) && task.depends_on.length
      ? task.depends_on.join(", ")
      : null;

  const shell = isCritical
    ? "bg-gradient-to-br from-red-600 to-red-500 shadow-red-900/20 ring-1 ring-red-300/80"
    : "bg-gradient-to-br from-blue-600 to-blue-500 shadow-blue-900/20 ring-1 ring-blue-300/70";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(task.id)}
      className={`w-full max-w-[220px] min-w-[160px] rounded-xl px-4 py-3 text-left text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 sm:w-auto ${shell} ${
        isSelected ? "ring-2 ring-indigo-200 ring-offset-2 ring-offset-slate-50" : ""
      } ${isDone ? "opacity-60 saturate-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/80">
          {task.id}
        </span>
        <span className="shrink-0 rounded-full border border-white/35 bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {task.priority || "—"}
        </span>
      </div>
      <p
        className={`mt-1.5 text-sm font-semibold leading-snug text-white ${
          isDone ? "line-through" : ""
        }`}
      >
        {task.name}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-white/85">
        {hours}
        {hours !== "—" ? " h est." : ""}
      </p>
      {deps && (
        <p className="mt-1.5 border-t border-white/20 pt-1.5 text-[10px] leading-tight text-white/75">
          Depends on: {deps}
        </p>
      )}
    </button>
  );
});

export const WorkflowFlowchart = memo(function WorkflowFlowchart({
  tasks,
  cpm,
  selectedTaskId,
  onSelectTask,
  completedTaskIds,
  flowReloadKey = 0,
}) {
  const levels = useMemo(() => buildFlowchartLevels(tasks || []), [tasks]);

  const criticalSet = useMemo(
    () => new Set(cpm?.criticalPath || []),
    [cpm?.criticalPath],
  );

  const doneSet = useMemo(() => {
    if (completedTaskIds instanceof Set) return completedTaskIds;
    return new Set(Array.isArray(completedTaskIds) ? completedTaskIds : []);
  }, [completedTaskIds]);

  if (!tasks?.length) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-gray-900 dark:hover:shadow-lg">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Flowchart view</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Top to bottom: each row is an execution stage. Tasks on the same row can run in parallel.
      </p>

      <div
        key={`flow-${flowReloadKey}-${tasks.map((t) => t.id).join("-")}`}
        className="mx-auto mt-5 flex w-max min-w-full max-w-3xl flex-col items-center gap-6 overflow-x-auto overflow-y-visible pb-2"
      >
        <FlowLabel>Start</FlowLabel>
        <FlowArrow />

        {levels.map((row, idx) => {
          const prev = idx > 0 ? levels[idx - 1] : null;
          const showMerge = prev && prev.length > 1 && row.length === 1;
          const showParallel = row.length > 1;

          return (
            <Fragment key={`level-${idx}-${row.map((t) => t.id).join("-")}`}>
              <div
                className="flowchart-level-enter flex w-full flex-col items-center gap-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {showMerge && (
                  <FlowLabel>
                    <span className="text-amber-700">Merge</span>
                  </FlowLabel>
                )}
                {showParallel && (
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                    Parallel execution
                  </p>
                )}
                <div
                  className={`flex w-full flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 ${
                    row.length === 1 ? "justify-center" : ""
                  }`}
                >
                  {row.map((task) => (
                    <FlowchartNode
                      key={task.id}
                      task={task}
                      isCritical={criticalSet.has(task.id)}
                      isSelected={selectedTaskId === task.id}
                      isDone={doneSet.has(task.id)}
                      onSelect={onSelectTask}
                    />
                  ))}
                </div>
              </div>
              <FlowArrow />
            </Fragment>
          );
        })}

        <FlowLabel>End</FlowLabel>
      </div>
    </section>
  );
});

export default WorkflowFlowchart;
