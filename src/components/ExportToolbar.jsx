import {
  buildPlanClipboardPayload,
  buildTasksCsv,
  copyToClipboard,
  downloadTextFile,
} from "../lib/exportPlan.js";
import { btnSecondary } from "../lib/buttonClasses.js";

export function ExportToolbar({ planData, tasks }) {
  const disabled = !planData?.tasks?.length || !tasks?.length;

  async function handleCsv() {
    const csv = buildTasksCsv(tasks);
    downloadTextFile("cortexflow-tasks.csv", csv, "text/csv;charset=utf-8");
  }

  async function handleCopy() {
    const text = buildPlanClipboardPayload(planData, tasks);
    await copyToClipboard(text);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Export
      </span>
      <button type="button" disabled={disabled} onClick={handleCsv} className={btnSecondary}>
        CSV
      </button>
      <button type="button" disabled={disabled} onClick={handleCopy} className={btnSecondary}>
        Copy JSON
      </button>
      <button type="button" disabled={disabled} onClick={handlePrint} className={btnSecondary}>
        Print / Save PDF
      </button>
    </section>
  );
}
