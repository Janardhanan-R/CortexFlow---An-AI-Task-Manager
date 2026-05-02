import { useState } from "react";
import { btnAccent } from "../lib/buttonClasses.js";

export function PlanChatPanel({ onAsk, loading, lastReply, error }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    const text = q.trim();
    if (!text || loading) return;
    onAsk(text);
    setQ("");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100"
      >
        Plan assistant (chat)
        <span className="text-xs text-slate-400">{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-2 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ask about critical path, bottlenecks, or delays — answers use your current plan context.
          </p>
          <form onSubmit={submit} className="mt-2 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. What is the critical path?"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            />
            <button type="submit" disabled={loading} className={btnAccent}>
              {loading ? "…" : "Ask"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
          {lastReply && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {lastReply}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
