import { kahnTopologicalSort } from "../lib/planner";
import { PriorityBadge } from "./PriorityBadge.jsx";
import { btnBase } from "../lib/buttonClasses.js";

export function TaskTracker({
  tasks,
  completedIds,
  onToggleComplete,
  onSelectTask,
  selectedTaskId,
  displayOrder,
}) {
  let orderedTasks = [];
  if (tasks?.length) {
    const map = new Map(tasks.map((t) => [t.id, t]));
    if (
      Array.isArray(displayOrder) &&
      displayOrder.length === tasks.length &&
      displayOrder.every((id) => map.has(id))
    ) {
      orderedTasks = displayOrder.map((id) => map.get(id)).filter(Boolean);
    } else {
      const topo = kahnTopologicalSort(tasks);
      if (topo.hasCycle) {
        orderedTasks = [...tasks].sort((a, b) => a.id.localeCompare(b.id));
      } else {
        orderedTasks = topo.order.map((id) => map.get(id)).filter(Boolean);
      }
    }
  }

  const completedSet =
    completedIds instanceof Set ? completedIds : new Set(completedIds || []);

  function handleCheck(task, checked) {
    onToggleComplete(task.id, checked, tasks);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900/80">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Execution checklist</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {completedSet.size}/{tasks.length} done
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Check off tasks as you finish. Completing a task highlights the next dependent step in the flowchart.
      </p>
      <ul className="max-h-[min(400px,55vh)] space-y-2 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable]">
        {orderedTasks.map((task) => {
          const done = completedSet.has(task.id);
          return (
            <li
              key={task.id}
              className={`flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-all duration-200 hover:border-indigo-200 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-indigo-500/50 dark:hover:bg-slate-900 ${
                selectedTaskId === task.id ? "ring-2 ring-indigo-300 dark:ring-indigo-500/60" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={(e) => handleCheck(task, e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                aria-label={`Mark ${task.name} complete`}
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectTask?.(task.id)}
                  className={`${btnBase} w-full text-left`}
                >
                  <span
                    className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${done ? "text-slate-500 line-through opacity-60 dark:text-slate-500" : ""}`}
                  >
                    {task.name}
                  </span>
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{task.id}</span>
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-300">{task.estimated_time_hours}h</span>
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
