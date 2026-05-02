const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "build",
  "create",
  "make",
  "app",
  "web",
  "using",
  "that",
  "this",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((w) => w.length > 2 && !STOP.has(w)) || [];
}

export function buildIntentView(planData) {
  if (!planData) {
    return { goal: "", keywords: [], features: [] };
  }
  const goal = planData.project_goal || "";
  const fromIntent = planData.intent;
  if (fromIntent && (fromIntent.keywords?.length || fromIntent.features?.length)) {
    return {
      goal: fromIntent.summary || goal,
      keywords: fromIntent.keywords || [],
      features: fromIntent.features || [],
    };
  }
  const taskTokens = (planData.tasks || []).flatMap((t) => tokenize(t.name));
  const goalTokens = tokenize(goal);
  const freq = new Map();
  [...goalTokens, ...taskTokens].forEach((w) => {
    freq.set(w, (freq.get(w) || 0) + 1);
  });
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 10);

  const features =
    planData.tasks?.slice(0, 8).map((t) => t.name) || [];

  return { goal, keywords, features };
}

const DESIGN_RE = /\b(design|wireframe|mockup|prototype|ux|ui|figma|brand|layout)\b/i;
const TEST_RE = /\b(test|qa|testing|regression|e2e|unit\s*test|quality)\b/i;

export function deriveHtnPhases(tasks) {
  const design = [];
  const development = [];
  const testing = [];
  for (const task of tasks || []) {
    const name = task.name || "";
    if (TEST_RE.test(name)) testing.push(task);
    else if (DESIGN_RE.test(name)) design.push(task);
    else development.push(task);
  }
  return [
    { id: "design", title: "Design", tasks: design },
    { id: "development", title: "Development", tasks: development },
    { id: "testing", title: "Testing", tasks: testing },
  ];
}

export function normalizeHtnFromPlan(planData) {
  const raw = planData?.htn_plan?.phases;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((p, i) => ({
    id: p.id || `phase-${i}`,
    title: p.title || p.name || `Phase ${i + 1}`,
    tasks: Array.isArray(p.tasks)
      ? p.tasks
          .map((t) =>
            typeof t === "string"
              ? planData.tasks?.find((x) => x.id === t || x.name === t) || {
                  id: t,
                  name: t,
                  priority: "medium",
                  depends_on: [],
                }
              : { priority: "medium", depends_on: [], ...t },
          )
          .filter(Boolean)
      : [],
  }));
}
