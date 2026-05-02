import { useEffect, useMemo, useState } from "react";

const STEPS = [
  "Analyzing input…",
  "Breaking into tasks…",
  "Mapping dependencies…",
  "Generating workflow…",
];

const TYPING_LINE = "AI is planning your workflow…";

export function ThinkingOverlay({ visible }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!visible) return undefined;
    const resetId = window.setTimeout(() => {
      setStepIndex(0);
      setTyped("");
    }, 0);
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1600);
    return () => {
      window.clearTimeout(resetId);
      window.clearInterval(id);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    const startId = window.setTimeout(() => setTyped(""), 0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(TYPING_LINE.slice(0, i));
      if (i >= TYPING_LINE.length) window.clearInterval(id);
    }, 45);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(id);
    };
  }, [visible]);

  const step = useMemo(() => STEPS[stepIndex], [stepIndex]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
        <p className="mt-6 min-h-[1.5rem] text-center font-mono text-sm font-medium text-indigo-900">
          {typed}
          <span className="inline-block w-2 animate-pulse">▍</span>
        </p>
        <p className="mt-4 text-center text-xs font-medium text-slate-600 transition-all duration-300">
          {step}
        </p>
        <div className="mt-6 space-y-2">
          <div className="h-2 animate-pulse rounded-full bg-slate-200" />
          <div
            className="h-2 w-[80%] animate-pulse rounded-full bg-slate-200"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-2 w-[55%] animate-pulse rounded-full bg-slate-200"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">This usually takes a few seconds</p>
      </div>
    </div>
  );
}
