import { applyTimeHeuristics } from "./timeHeuristics.js";

export const LLM_SYSTEM_PROMPT = `You are an AI Project Planning Assistant.

Convert input into structured workflow.

Return ONLY JSON:

{
"project_goal": string,
"tasks": [
{
"id": "T1",
"name": string,
"depends_on": [],
"estimated_time_hours": number,
"priority": "low | medium | high"
}
],
"execution_plan": {
"parallel_groups": [
["T1", "T2"],
["T3"]
],
"sequential_order": ["T1", "T3"]
},
"time_estimation": {
"total_estimated_hours": number,
"critical_path": ["T1", "T3"],
"bottleneck_tasks": ["T3"]
}
}

Rules:

* DO NOT create linear chain
* Allow parallel tasks
* Remove duplicate tasks
* Assign realistic time (2–40 hrs)
* Ensure valid dependencies
* No circular dependencies

Return ONLY JSON.`;

const priorityRank = { low: 1, medium: 2, high: 3 };

export function splitPromptIntoIdeas(input) {
  return input
    .split(/[.!?\n;]+/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);
}

export function normalizePrompt(input) {
  return input.replace(/\s+/g, " ").trim();
}

export function extractJson(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM did not return JSON.");
  }
  return raw.slice(start, end + 1);
}

export function sanitizePlan(plan) {
  const taskMap = new Map();
  const duplicates = [];
  const invalidDependencies = [];

  for (const task of plan.tasks || []) {
    const nameKey = (task.name || "").trim().toLowerCase();
    if (!nameKey) continue;
    if (taskMap.has(nameKey)) {
      duplicates.push(task.name);
      const existing = taskMap.get(nameKey);
      existing.estimated_time_hours = Math.max(
        existing.estimated_time_hours,
        Number(task.estimated_time_hours) || 2,
      );
      if (priorityRank[task.priority] > priorityRank[existing.priority]) {
        existing.priority = task.priority;
      }
      continue;
    }
    taskMap.set(nameKey, {
      id: task.id,
      name: task.name.trim(),
      depends_on: Array.isArray(task.depends_on) ? task.depends_on : [],
      estimated_time_hours: clampHours(task.estimated_time_hours),
      priority: normalizePriority(task.priority),
    });
  }

  const dedupedTasks = Array.from(taskMap.values()).map((task, idx) => ({
    ...task,
    id: `T${idx + 1}`,
  }));

  const oldToNew = new Map();
  dedupedTasks.forEach((task, idx) => {
    oldToNew.set(task.id, `T${idx + 1}`);
    task.id = `T${idx + 1}`;
  });

  dedupedTasks.forEach((task) => {
    const deps = (task.depends_on || [])
      .map((dep) => oldToNew.get(dep) || dep)
      .filter((dep) => dedupedTasks.some((t) => t.id === dep) && dep !== task.id);
    if (deps.length !== (task.depends_on || []).length) {
      invalidDependencies.push(task.id);
    }
    task.depends_on = Array.from(new Set(deps));
  });

  const refinedTasks = dedupedTasks.map((t) => applyTimeHeuristics(t));

  return {
    project_goal: plan.project_goal || "Untitled project",
    tasks: refinedTasks,
    execution_plan: plan.execution_plan || { parallel_groups: [], sequential_order: [] },
    time_estimation: plan.time_estimation || {},
    intent: plan.intent,
    htn_plan: plan.htn_plan,
    conflict_analysis: plan.conflict_analysis || null,
    conflicts: {
      duplicate_tasks: duplicates,
      invalid_dependencies: Array.from(new Set(invalidDependencies)),
    },
  };
}

export function buildAdjacency(tasks) {
  const graph = {};
  const inDegree = {};
  tasks.forEach((task) => {
    graph[task.id] = [];
    inDegree[task.id] = 0;
  });
  tasks.forEach((task) => {
    for (const dep of task.depends_on) {
      if (graph[dep]) {
        graph[dep].push(task.id);
        inDegree[task.id] += 1;
      }
    }
  });
  return { graph, inDegree };
}

export function kahnTopologicalSort(tasks) {
  const { graph, inDegree } = buildAdjacency(tasks);
  const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      inDegree[next] -= 1;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return {
    order,
    hasCycle: order.length !== tasks.length,
  };
}

export function detectConflicts(tasks) {
  const nameSet = new Set();
  const duplicateTaskNames = [];
  const invalidDependencies = [];

  const ids = new Set(tasks.map((task) => task.id));
  tasks.forEach((task) => {
    const key = task.name.toLowerCase();
    if (nameSet.has(key)) duplicateTaskNames.push(task.name);
    nameSet.add(key);
    task.depends_on.forEach((dep) => {
      if (!ids.has(dep)) invalidDependencies.push(`${task.id}->${dep}`);
    });
  });

  const topo = kahnTopologicalSort(tasks);

  return {
    duplicateTaskNames: Array.from(new Set(duplicateTaskNames)),
    invalidDependencies: Array.from(new Set(invalidDependencies)),
    hasCycle: topo.hasCycle,
  };
}

export function buildLevelGroups(tasks) {
  const { graph, inDegree } = buildAdjacency(tasks);
  const localInDegree = { ...inDegree };
  let current = Object.keys(localInDegree).filter((id) => localInDegree[id] === 0);
  const levels = [];

  while (current.length > 0) {
    levels.push(current);
    const nextLevel = [];
    current.forEach((node) => {
      graph[node].forEach((next) => {
        localInDegree[next] -= 1;
        if (localInDegree[next] === 0) nextLevel.push(next);
      });
    });
    current = nextLevel;
  }
  return levels;
}

export function runCpmLite(tasks) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const topo = kahnTopologicalSort(tasks);
  if (topo.hasCycle) {
    return {
      totalEstimatedHours: 0,
      criticalPath: [],
      bottlenecks: [],
      earliestFinish: {},
    };
  }

  const earliestFinish = {};
  const parentOnCritical = {};

  topo.order.forEach((taskId) => {
    const task = taskMap.get(taskId);
    const duration = clampHours(task.estimated_time_hours);
    let bestParent = null;
    let bestStart = 0;
    task.depends_on.forEach((dep) => {
      const depFinish = earliestFinish[dep] || 0;
      if (depFinish > bestStart) {
        bestStart = depFinish;
        bestParent = dep;
      }
    });
    earliestFinish[taskId] = bestStart + duration;
    parentOnCritical[taskId] = bestParent;
  });

  let criticalEnd = null;
  let maxFinish = 0;
  Object.entries(earliestFinish).forEach(([id, finish]) => {
    if (finish > maxFinish) {
      maxFinish = finish;
      criticalEnd = id;
    }
  });

  const criticalPath = [];
  let cursor = criticalEnd;
  while (cursor) {
    criticalPath.unshift(cursor);
    cursor = parentOnCritical[cursor];
  }

  return {
    totalEstimatedHours: tasks.reduce((sum, t) => sum + clampHours(t.estimated_time_hours), 0),
    criticalPath,
    bottlenecks: criticalPath.length ? [criticalPath[criticalPath.length - 1]] : [],
    earliestFinish,
  };
}

function normalizePriority(priority) {
  if (priority === "high" || priority === "medium" || priority === "low") return priority;
  return "medium";
}

/** Clamps task duration to planner bounds (2–40h). Exported for UI simulation. */
export function clampHours(hours) {
  const value = Number(hours);
  if (Number.isNaN(value)) return 2;
  return Math.min(40, Math.max(2, Math.round(value)));
}
