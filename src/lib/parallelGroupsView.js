import { buildLevelGroups } from "./planner";

/**
 * Parallel execution groups: prefer execution_plan.parallel_groups, else infer from levels.
 */
export function buildParallelGroupsDisplay(planData, tasks) {
  if (!tasks?.length) return [];

  const idToName = new Map(tasks.map((t) => [t.id, t.name]));
  const raw = planData?.execution_plan?.parallel_groups;

  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((group) => {
        const ids = Array.isArray(group) ? group : [];
        const names = ids.map((id) => idToName.get(id) || id);
        return { ids, names };
      })
      .filter((g) => g.names.length > 1);
  }

  const levels = buildLevelGroups(tasks);
  return levels
    .filter((ids) => ids.length > 1)
    .map((ids) => ({
      ids,
      names: ids.map((id) => idToName.get(id) || id),
    }));
}
