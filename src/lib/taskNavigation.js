import { kahnTopologicalSort } from "./planner";

/** Tasks that list `taskId` as a dependency (successors). */
export function getSuccessorTasks(taskId, tasks) {
  if (!taskId || !tasks?.length) return [];
  return tasks.filter((t) => t.depends_on?.includes(taskId));
}

export function getNavigationSets(selectedTaskId, tasks) {
  const nextIds = new Set();
  const prevIds = new Set();
  if (!selectedTaskId || !tasks?.length) {
    return { nextIds, prevIds, navRole: () => "default" };
  }
  for (const t of tasks) {
    if (t.depends_on?.includes(selectedTaskId)) nextIds.add(t.id);
  }
  const current = tasks.find((t) => t.id === selectedTaskId);
  for (const dep of current?.depends_on || []) {
    prevIds.add(dep);
  }
  const navRole = (taskId) => {
    if (taskId === selectedTaskId) return "current";
    if (nextIds.has(taskId)) return "next";
    if (prevIds.has(taskId)) return "prev";
    return "dim";
  };
  return { nextIds, prevIds, navRole };
}

export function getTopoOrderIds(tasks) {
  const { order, hasCycle } = kahnTopologicalSort(tasks || []);
  if (hasCycle) return tasks?.map((t) => t.id) || [];
  return order;
}

export function getNextStepTaskId(selectedTaskId, tasks) {
  const successors = getSuccessorTasks(selectedTaskId, tasks);
  if (!successors.length) return null;
  const order = getTopoOrderIds(tasks);
  const rank = (id) => {
    const i = order.indexOf(id);
    return i === -1 ? 999 : i;
  };
  return [...successors].sort((a, b) => rank(a.id) - rank(b.id))[0]?.id ?? null;
}

export function getPreviousStepTaskId(selectedTaskId, tasks) {
  if (!selectedTaskId || !tasks?.length) return null;
  const order = getTopoOrderIds(tasks);
  const idx = order.indexOf(selectedTaskId);
  if (idx <= 0) return null;
  return order[idx - 1];
}

function doneSet(completedIds) {
  return completedIds instanceof Set ? completedIds : new Set(completedIds || []);
}

/** Tasks ready to start: incomplete and all dependencies completed. */
export function getReadyTasks(tasks, completedIds) {
  if (!tasks?.length) return [];
  const done = doneSet(completedIds);
  return tasks.filter(
    (t) =>
      !done.has(t.id) && (t.depends_on || []).every((dep) => done.has(dep)),
  );
}

/** Next guided step: first ready task in topological order. */
export function getFirstReadyTaskId(tasks, completedIds) {
  const ready = getReadyTasks(tasks, completedIds);
  if (!ready.length) return null;
  const order = getTopoOrderIds(tasks);
  ready.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return ready[0].id;
}
