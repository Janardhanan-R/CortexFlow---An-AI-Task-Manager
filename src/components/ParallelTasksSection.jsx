import { buildParallelGroupsDisplay } from "../lib/parallelGroupsView";

export function ParallelTasksSection({ planData, tasks }) {
  const groups = buildParallelGroupsDisplay(planData, tasks);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Parallel tasks</h2>
      <p className="mt-1 text-xs text-slate-500">
        Groups of tasks that can run at the same time (same execution stage).
      </p>
      {!groups.length ? (
        <p className="mt-4 text-sm text-slate-600">
          No parallel groups — work is mostly sequential in this plan.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {groups.map((g, idx) => (
            <li
              key={g.ids.join("-") + idx}
              className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 ring-1 ring-amber-100/80"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
                Parallel execution {groups.length > 1 ? `#${idx + 1}` : ""}
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">
                {g.names.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
