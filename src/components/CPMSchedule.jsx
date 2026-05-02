import { kahnTopologicalSort } from "../lib/planner";
import { PriorityBadge } from "./PriorityBadge.jsx";

export function CPMSchedule({ tasks, selectedTaskId, onSelectTask }) {
  let rows = [];
  if (tasks?.length) {
    const topo = kahnTopologicalSort(tasks);
    const map = new Map(tasks.map((t) => [t.id, t]));
    if (topo.hasCycle) {
      rows = tasks.map((t) => ({
        task: t,
        hours: t.estimated_time_hours,
      }));
    } else {
      rows = topo.order
        .map((id) => map.get(id))
        .filter(Boolean)
        .map((task) => ({
          task,
          hours: task.estimated_time_hours,
        }));
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">CPM schedule</h2>
      <p className="mb-3 text-xs text-slate-500">
        Tasks in topological order with estimated duration and priority.
      </p>
      {!rows.length ? (
        <p className="text-xs text-slate-500">No tasks to show.</p>
      ) : (
        <div className="max-h-[min(400px,60vh)] min-h-0 overflow-y-auto overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-600">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ task, hours }) => (
                <tr
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTask?.(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectTask?.(task.id);
                    }
                  }}
                  className={`cursor-pointer bg-white transition-all duration-200 hover:bg-slate-50 ${
                    selectedTaskId === task.id ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {task.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">{task.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{hours}h</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
