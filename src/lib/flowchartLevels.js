import { buildLevelGroups } from "./planner";

/**
 * Topological levels as full task rows for flowchart UI.
 * Any task missing from layering (edge case) is appended as its own row.
 */
export function buildFlowchartLevels(tasks) {
  if (!tasks?.length) return [];

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const levelIdGroups = buildLevelGroups(tasks);
  const placed = new Set();

  const levels = levelIdGroups
    .map((ids) => {
      const row = ids.map((id) => byId.get(id)).filter(Boolean);
      row.forEach((t) => placed.add(t.id));
      return row;
    })
    .filter((row) => row.length > 0);

  const missing = tasks.filter((t) => !placed.has(t.id));
  if (missing.length) levels.push(missing);

  return levels;
}
