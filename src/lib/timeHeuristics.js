function clampLocal(hours) {
  const value = Number(hours);
  if (Number.isNaN(value)) return 2;
  return Math.min(40, Math.max(2, Math.round(value)));
}

const priorityRank = { low: 1, medium: 2, high: 3 };

function maxPriority(a, b) {
  return priorityRank[a] >= priorityRank[b] ? a : b;
}

/** Nudge hours / priority from task name (UI vs backend vs payment patterns). */
export function applyTimeHeuristics(task) {
  const name = (task.name || "").toLowerCase();
  let hours = Number(task.estimated_time_hours) || 2;
  let priority = task.priority || "medium";

  if (/payment|billing|checkout|stripe|pci|wallet|invoice/.test(name)) {
    hours = Math.max(hours, 14);
    priority = maxPriority(priority, "high");
  }
  if (/backend|api|server|database|auth|security|infra|deploy/.test(name)) {
    hours = Math.max(hours, 10);
    priority = maxPriority(priority, "high");
  }
  if (/ui|ux|frontend|dashboard|screen|page|component|style|css/.test(name)) {
    hours = Math.max(hours, Math.min(hours + 2, 40));
    priority = maxPriority(priority, "medium");
  }

  return {
    ...task,
    estimated_time_hours: clampLocal(hours),
    priority,
  };
}
