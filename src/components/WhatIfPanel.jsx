import { useEffect, useState } from "react";
import { btnAmber } from "../lib/buttonClasses.js";
import { clampHours } from "../lib/planner.js";

export function WhatIfPanel({
  tasks,
  sumTaskHours,
  projectedDuration,
  onDurationChange,
  onRecalculate,
  bottleneckMessage,
  onRemoveTask,
  onAddTask,
}) {
  const [newName, setNewName] = useState("");
  const [newHours, setNewHours] = useState(8);
  const [newDeps, setNewDeps] = useState("");

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log("Tasks rendered (What-if):", tasks.length);
  }, [tasks.length]);

  if (!tasks.length) return null;

  return (
    <section className="flex w-full min-w-0 flex-col overflow-visible rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-sm dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-amber-50">What-if simulation</h2>
          <p className="text-xs text-slate-600 dark:text-amber-200/90">
            Edit durations, add or remove tasks (what-if draft). CPM and critical path update live.
          </p>
          <p className="mt-1 text-[11px] font-medium text-amber-900 dark:text-amber-200">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} in simulation
          </p>
        </div>
        <button type="button" onClick={onRecalculate} className={btnAmber}>
          Recalculate
        </button>
      </div>

      {bottleneckMessage && (
        <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-100">
          {bottleneckMessage}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-amber-100 bg-white/90 p-3 text-sm dark:border-amber-900 dark:bg-slate-900/60 sm:grid-cols-2">
        <p className="text-slate-800 dark:text-slate-100">
          <span className="font-semibold text-slate-900 dark:text-slate-50">Sum of task hours</span>
          <span className="ml-2 font-mono text-base font-bold tabular-nums text-amber-900 dark:text-amber-200">
            {sumTaskHours}h
          </span>
        </p>
        <p className="text-slate-800 dark:text-slate-100">
          <span className="font-semibold text-slate-900 dark:text-slate-50">Project duration (CPM)</span>
          <span className="ml-2 font-mono text-base font-bold tabular-nums text-red-800 dark:text-red-300">
            {projectedDuration}h
          </span>
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/50">
        <p className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">Add task (draft)</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Task name"
            className="min-w-[160px] flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            min={2}
            max={40}
            value={newHours}
            onChange={(e) => setNewHours(Number(e.target.value))}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            value={newDeps}
            onChange={(e) => setNewDeps(e.target.value)}
            placeholder="Deps: T1,T2"
            className="min-w-[120px] flex-1 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500"
            onClick={() => {
              if (!newName.trim()) return;
              const deps = newDeps
                .split(/[,\s]+/)
                .map((s) => s.trim())
                .filter(Boolean);
              onAddTask?.({ name: newName.trim(), hours: newHours, depends_on: deps });
              setNewName("");
              setNewDeps("");
              setNewHours(8);
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div
        className="flex max-h-[500px] min-h-0 w-full flex-col gap-2 overflow-y-auto overflow-x-auto rounded-xl border border-slate-200/90 bg-white p-4 shadow-md [scrollbar-gutter:stable] [scrollbar-width:thin] dark:border-slate-700 dark:bg-slate-900 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
        role="region"
        aria-label="What-if task list"
      >
        <ul className="flex w-full min-w-0 flex-col gap-2">
          {tasks.map((task) => {
            const safeVal = clampHours(task.estimated_time_hours);
            return (
              <li
                key={task.id}
                className="flex w-full max-w-full flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {task.id}
                  </span>
                  <span className="ml-2 font-medium text-slate-800 dark:text-slate-100">{task.name}</span>
                </div>
                <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap md:w-auto">
                  <div className="w-full min-w-0 md:w-40">
                    <input
                      type="range"
                      min={2}
                      max={40}
                      value={safeVal}
                      onChange={(e) =>
                        onDurationChange(task.id, Number(e.target.value))
                      }
                      className="w-full min-w-0 accent-amber-600"
                      aria-label={`Hours for ${task.name}`}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      type="number"
                      min={2}
                      max={40}
                      value={safeVal}
                      onChange={(e) =>
                        onDurationChange(task.id, Number(e.target.value))
                      }
                      className="w-16 shrink-0 rounded border border-slate-300 px-2 py-1 text-center text-sm tabular-nums dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <span className="w-4 shrink-0 text-slate-500">h</span>
                    <button
                      type="button"
                      className="rounded border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50"
                      onClick={() => onRemoveTask?.(task.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
