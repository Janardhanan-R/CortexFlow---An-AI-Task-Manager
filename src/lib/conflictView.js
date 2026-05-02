/**
 * Normalize LLM conflict_analysis or derive human-readable rows from app conflicts.
 */
export function buildConflictRows(planData) {
  const rows = [];
  const ca = planData?.conflict_analysis;

  if (ca?.issues && Array.isArray(ca.issues)) {
    for (const item of ca.issues) {
      if (!item || typeof item !== "object") continue;
      const issue = item.issue || item.title || item.summary || "Issue";
      const explanation =
        item.explanation || item.detail || item.description || "";
      const suggestedFix =
        item.suggested_fix || item.suggestedFix || item.fix || "";
      rows.push({ issue, explanation, suggestedFix });
    }
    if (rows.length) return rows;
  }

  const c = planData?.conflicts || {};
  if (c.has_cycle) {
    rows.push({
      issue: "Circular dependencies",
      explanation:
        "The workflow cannot be scheduled because some tasks depend on each other in a loop.",
      suggestedFix:
        "Edit dependencies so each task only depends on work that finishes earlier (no cycles).",
    });
  }

  for (const name of c.duplicate_tasks || []) {
    rows.push({
      issue: `Duplicate task: “${name}”`,
      explanation:
        "The same task name appeared more than once. Duplicates were merged when building the plan.",
      suggestedFix:
        "Use distinct names for distinct work, or confirm merged tasks match your intent.",
    });
  }

  for (const entry of c.invalid_dependencies || []) {
    rows.push({
      issue: `Unresolved dependencies (task ${entry})`,
      explanation:
        "Some dependency ids from the model did not match tasks in the plan after normalization.",
      suggestedFix:
        "Regenerate the plan or ensure each depends_on entry references a valid task id.",
    });
  }

  return rows;
}

export function hasConflictSignal(planData) {
  return buildConflictRows(planData).length > 0;
}
