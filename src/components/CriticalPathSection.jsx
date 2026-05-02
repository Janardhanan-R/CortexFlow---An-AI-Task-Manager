export function CriticalPathSection({ taskNames }) {
  const line =
    taskNames?.length > 0 ? taskNames.join(" → ") : "—";

  return (
    <section className="rounded-xl border-2 border-red-200 bg-red-50/80 p-4 shadow-md ring-1 ring-red-100 dark:border-red-800 dark:bg-red-950/40 dark:ring-red-900/50">
      <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">Critical path</h2>
      <p className="mt-1 text-xs text-red-800/90 dark:text-red-300/90">
        Longest chain of dependent work — delays here delay the project.
      </p>
      <p className="mt-4 text-base font-bold leading-relaxed text-red-700 dark:text-red-400">
        {line}
      </p>
    </section>
  );
}
