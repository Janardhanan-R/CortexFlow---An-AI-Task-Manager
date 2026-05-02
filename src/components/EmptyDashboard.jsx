import { btnAccent } from "../lib/buttonClasses.js";

const EXAMPLES = [
  "Build a food delivery web app",
  "Launch a SaaS analytics dashboard with billing",
  "Mobile fitness app with social login and subscriptions",
];

export function EmptyDashboard({ onTryExample }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-inner">
      <p className="text-4xl">✨</p>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Enter a project idea to generate a workflow</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        CortexFlow turns your idea into a structured workflow: phases, parallel work, CPM schedule, and a
        flowchart — plus what-if simulation and critical-path insight.
      </p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Try an example</p>
      <div className="mt-3 flex max-w-lg flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onTryExample(ex)}
            className={`${btnAccent} border border-indigo-500/30 text-left text-xs`}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
