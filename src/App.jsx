import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  explainWorkflowFromGemini,
  getStructuredPlanFromGemini,
  improvePlanFromGemini,
  planChatFromGemini,
} from "./lib/llm";
import {
  buildLevelGroups,
  clampHours,
  detectConflicts,
  normalizePrompt,
  runCpmLite,
  sanitizePlan,
  splitPromptIntoIdeas,
} from "./lib/planner";
import { analyzeInputForFeatures } from "./lib/inputAnalysis";
import {
  getFirstReadyTaskId,
  getSuccessorTasks,
  getTopoOrderIds,
} from "./lib/taskNavigation";
import { analyzeRisks } from "./lib/riskHeuristics";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { Header } from "./components/Header.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { MainLayout } from "./components/MainLayout.jsx";
import { InputBar } from "./components/InputBar.jsx";

const DEMO_PROMPT =
  "Build a team collaboration SaaS with login, project dashboard, notifications, billing integration, and QA.";

function nextTaskIdFromList(tasks) {
  const nums = (tasks || []).map((t) => {
    const m = String(t.id).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  return `T${Math.max(0, ...nums, 0) + 1}`;
}

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planData, setPlanData] = useState(null);
  const [simulatedTasks, setSimulatedTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [fitGraphTick, setFitGraphTick] = useState(0);

  const [explainLoading, setExplainLoading] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainError, setExplainError] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState(() => new Set());

  const [executionMode, setExecutionMode] = useState(false);
  const [taskDisplayOrder, setTaskDisplayOrder] = useState(null);

  const [improveLoading, setImproveLoading] = useState(false);
  const [improveText, setImproveText] = useState("");
  const [improveError, setImproveError] = useState("");

  const [chatLoading, setChatLoading] = useState(false);
  const [chatReply, setChatReply] = useState("");
  const [chatError, setChatError] = useState("");

  const [bottleneckMessage, setBottleneckMessage] = useState("");
  const prevBottleneckRef = useRef(null);
  const userSimulatedRef = useRef(false);

  const [demoAnimating, setDemoAnimating] = useState(false);

  const debouncedInput = useDebouncedValue(input, 400);
  const inputAnalysis = useMemo(
    () => analyzeInputForFeatures(debouncedInput),
    [debouncedInput],
  );

  /** Stable fingerprint so we only reset simulation when the plan’s task *set* changes (not on unrelated planData churn). */
  const planTaskIdsKey = useMemo(() => {
    const tasks = planData?.tasks;
    if (!tasks?.length) return "";
    return `${tasks.length}:${tasks.map((t) => t.id).join(",")}`;
  }, [planData]);

  useEffect(() => {
    if (!planTaskIdsKey) {
      setSimulatedTasks([]);
      return;
    }
    const tasks = planData?.tasks;
    if (!tasks?.length) return;
    setSimulatedTasks(tasks.map((t) => ({ ...t })));
    setTaskDisplayOrder(null);
    userSimulatedRef.current = false;
    prevBottleneckRef.current = null;
    setBottleneckMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when planTaskIdsKey (task id set) changes; planData here is the render that produced that key.
  }, [planTaskIdsKey]);

  /** Full workflow list for CPM/UI: plan tasks still in simulation (by id) + user-added what-if tasks. Always id-based; never index-based. */
  const tasksWithSim = useMemo(() => {
    if (!planData?.tasks?.length) return [];
    const plan = planData.tasks;
    if (!simulatedTasks.length) {
      return plan.map((t) => ({ ...t }));
    }
    const planIdSet = new Set(plan.map((t) => t.id));
    const simById = new Map(simulatedTasks.map((t) => [t.id, t]));
    const fromPlan = plan
      .filter((pt) => simById.has(pt.id))
      .map((pt) => {
        const s = simById.get(pt.id);
        return {
          ...pt,
          ...s,
          depends_on: Array.isArray(s.depends_on) ? s.depends_on : pt.depends_on ?? [],
        };
      });
    const userAdded = simulatedTasks.filter((t) => !planIdSet.has(t.id));
    return [...fromPlan, ...userAdded];
  }, [planData, simulatedTasks]);

  useEffect(() => {
    if (!import.meta.env.DEV || !planData?.tasks) return;
    console.log("[What-if] Total tasks (plan):", planData.tasks.length);
    console.log("[What-if] Simulated state length:", simulatedTasks.length);
    console.log("[What-if] Rendered (tasksWithSim) length:", tasksWithSim.length);
  }, [planData, simulatedTasks, tasksWithSim]);

  const cpm = useMemo(() => {
    if (!tasksWithSim.length) return null;
    return runCpmLite(tasksWithSim);
  }, [tasksWithSim]);

  const sumTaskHours = useMemo(
    () =>
      tasksWithSim.reduce((acc, t) => acc + clampHours(t.estimated_time_hours), 0),
    [tasksWithSim],
  );

  const projectedDuration = useMemo(
    () => Math.max(0, ...Object.values(cpm?.earliestFinish || {}), 0),
    [cpm?.earliestFinish],
  );

  const risks = useMemo(() => analyzeRisks(tasksWithSim, cpm), [tasksWithSim, cpm]);

  useEffect(() => {
    const b = cpm?.bottlenecks?.[0] ?? null;
    const task = b ? tasksWithSim.find((t) => t.id === b) : null;
    if (!task) {
      setBottleneckMessage("");
      prevBottleneckRef.current = b;
      return;
    }
    if (userSimulatedRef.current && prevBottleneckRef.current !== b) {
      setBottleneckMessage(
        `Plan updated: "${task.name}" is now the bottleneck on the critical path.`,
      );
    }
    prevBottleneckRef.current = b;
  }, [cpm?.bottlenecks, tasksWithSim]);

  useEffect(() => {
    if (!planData?.tasks?.length) return;
    setCompletedTaskIds(new Set());
    setExplainText("");
    setExplainError("");
    setImproveText("");
    setImproveError("");
    setExecutionMode(false);
    setDemoAnimating(false);
  }, [planData]);

  useEffect(() => {
    if (!demoAnimating || !tasksWithSim.length) return undefined;
    const order = getTopoOrderIds(tasksWithSim);
    if (!order.length) return undefined;
    setCompletedTaskIds(new Set());
    let step = 0;
    const id = window.setInterval(() => {
      if (step >= order.length) {
        window.clearInterval(id);
        setDemoAnimating(false);
        return;
      }
      const tid = order[step];
      setCompletedTaskIds((prev) => new Set([...prev, tid]));
      setSelectedTaskId(tid);
      setFitGraphTick((x) => x + 1);
      step += 1;
    }, 1100);
    return () => window.clearInterval(id);
  }, [demoAnimating, tasksWithSim]);

  const updateTaskDuration = useCallback(
    (taskId, rawHours) => {
      userSimulatedRef.current = true;
      const hours = clampHours(rawHours);
      setSimulatedTasks((prev) => {
        const base =
          prev.length > 0
            ? prev
            : planData?.tasks?.length
              ? planData.tasks.map((t) => ({ ...t }))
              : [];
        if (!base.length) return prev;
        return base.map((t) =>
          t.id === taskId ? { ...t, estimated_time_hours: hours } : t,
        );
      });
    },
    [planData],
  );

  const removeSimulatedTask = useCallback(
    (taskId) => {
      userSimulatedRef.current = true;
      setTaskDisplayOrder(null);
      setSimulatedTasks((prev) => {
        const base =
          prev.length > 0
            ? prev
            : planData?.tasks?.length
              ? planData.tasks.map((t) => ({ ...t }))
              : [];
        return base
          .filter((t) => t.id !== taskId)
          .map((t) => ({
            ...t,
            depends_on: (t.depends_on || []).filter((d) => d !== taskId),
          }));
      });
    },
    [planData],
  );

  const addSimulatedTask = useCallback(
    ({ name, hours, depends_on }) => {
      userSimulatedRef.current = true;
      setTaskDisplayOrder(null);
      setSimulatedTasks((prev) => {
        const base =
          prev.length > 0
            ? prev
            : planData?.tasks?.length
              ? planData.tasks.map((t) => ({ ...t }))
              : [];
        const id = nextTaskIdFromList(base);
        const validDeps = (depends_on || []).filter((d) =>
          base.some((t) => t.id === d),
        );
        const task = {
          id,
          name,
          estimated_time_hours: clampHours(hours),
          priority: "medium",
          depends_on: validDeps,
        };
        return [...base, task];
      });
    },
    [planData],
  );

  const onToggleTaskComplete = useCallback((taskId, checked, taskList) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(taskId);
        if (!executionMode) {
          const successors = getSuccessorTasks(taskId, taskList).filter((t) => !next.has(t.id));
          const order = getTopoOrderIds(taskList);
          const rank = (tid) => {
            const i = order.indexOf(tid);
            return i === -1 ? 999 : i;
          };
          successors.sort((a, b) => rank(a.id) - rank(b.id));
          const pick = successors[0];
          if (pick) queueMicrotask(() => setSelectedTaskId(pick.id));
        } else {
          const nid = getFirstReadyTaskId(taskList, next);
          queueMicrotask(() => setSelectedTaskId(nid || ""));
        }
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }, [executionMode]);

  const completeGuidedTask = useCallback(
    (taskId) => {
      setCompletedTaskIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        queueMicrotask(() => {
          const nid = getFirstReadyTaskId(tasksWithSim, next);
          setSelectedTaskId(nid || "");
        });
        return next;
      });
    },
    [tasksWithSim],
  );

  const startGuided = useCallback(() => {
    setExecutionMode(true);
    const id = getFirstReadyTaskId(tasksWithSim, completedTaskIds);
    setSelectedTaskId(id || "");
  }, [tasksWithSim, completedTaskIds]);

  const handleRecalculateGraph = useCallback(() => {
    setFitGraphTick((t) => t + 1);
  }, []);

  const appendToInput = useCallback((fragment) => {
    const add = String(fragment).trim();
    if (!add) return;
    setInput((prev) => (String(prev).trim() ? `${String(prev).trim()} ` : "") + add);
  }, []);

  const executePlanGeneration = useCallback(async (mergedInput) => {
    const trimmed = mergedInput.trim();
    if (!trimmed) {
      setError("Enter a project description.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const normalized = normalizePrompt(trimmed);
      const promptParts = splitPromptIntoIdeas(normalized);
      const finalPrompt = promptParts.join(". ");

      const rawPlan = await getStructuredPlanFromGemini(finalPrompt);
      const cleaned = sanitizePlan(rawPlan);
      const conflicts = detectConflicts(cleaned.tasks);
      cleaned.conflicts = {
        ...cleaned.conflicts,
        duplicate_tasks: Array.from(
          new Set([...(cleaned.conflicts.duplicate_tasks || []), ...conflicts.duplicateTaskNames]),
        ),
        invalid_dependencies: Array.from(
          new Set([
            ...(cleaned.conflicts.invalid_dependencies || []),
            ...conflicts.invalidDependencies,
          ]),
        ),
        has_cycle: conflicts.hasCycle,
      };
      if (conflicts.hasCycle) {
        throw new Error("Circular dependency detected. Please refine the input.");
      }

      setPlanData(cleaned);
      setHistory((prev) => [finalPrompt, ...prev].slice(0, 10));
      setSelectedTaskId("");
      setFitGraphTick((t) => t + 1);
    } catch (err) {
      setError(err.message || "Failed to generate workflow.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleGenerate(forceText) {
    const baseInput = forceText || input;
    await executePlanGeneration(baseInput);
  }

  const runDemo = useCallback(async () => {
    setInput(DEMO_PROMPT);
    setError("");
    setLoading(true);
    try {
      const normalized = normalizePrompt(DEMO_PROMPT);
      const rawPlan = await getStructuredPlanFromGemini(normalized);
      const cleaned = sanitizePlan(rawPlan);
      const conflicts = detectConflicts(cleaned.tasks);
      cleaned.conflicts = {
        ...cleaned.conflicts,
        duplicate_tasks: Array.from(
          new Set([...(cleaned.conflicts.duplicate_tasks || []), ...conflicts.duplicateTaskNames]),
        ),
        invalid_dependencies: Array.from(
          new Set([
            ...(cleaned.conflicts.invalid_dependencies || []),
            ...conflicts.invalidDependencies,
          ]),
        ),
        has_cycle: conflicts.hasCycle,
      };
      if (conflicts.hasCycle) throw new Error("Cycle in demo plan.");
      setPlanData(cleaned);
      setHistory((prev) => [normalized, ...prev].slice(0, 10));
      setSelectedTaskId("");
      setFitGraphTick((t) => t + 1);
      setDemoAnimating(true);
    } catch (err) {
      setError(err.message || "Demo failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExplainPlan = useCallback(async () => {
    if (!planData?.tasks?.length) return;

    setExplainLoading(true);
    setExplainError("");
    setExplainText("");

    try {
      const criticalPath = cpm?.criticalPath?.length
        ? cpm.criticalPath
        : planData.time_estimation?.critical_path || [];
      const earliestFinish = cpm?.earliestFinish || {};
      const projected = Math.max(0, ...Object.values(earliestFinish), 0);

      const workflowPayload = {
        project_goal: planData.project_goal,
        tasks: tasksWithSim.map((t) => ({
          id: t.id,
          name: t.name,
          depends_on: t.depends_on,
          hours: t.estimated_time_hours,
          priority: t.priority,
        })),
        critical_path: criticalPath,
        projected_duration_hours: projected,
        parallel_groups: buildLevelGroups(planData.tasks),
      };

      const summary = JSON.stringify(workflowPayload, null, 2);
      const text = await explainWorkflowFromGemini(summary);
      setExplainText(text);
    } catch (err) {
      console.error("Explain error:", err);
      setExplainError(err.message || "Failed to generate explanation.");
    } finally {
      setExplainLoading(false);
    }
  }, [planData, cpm, tasksWithSim]);

  const clearExplain = useCallback(() => {
    setExplainText("");
    setExplainError("");
  }, []);

  const handleImprovePlan = useCallback(async () => {
    if (!planData?.tasks?.length) return;
    setImproveLoading(true);
    setImproveError("");
    setImproveText("");
    try {
      const payload = JSON.stringify(
        {
          project_goal: planData.project_goal,
          tasks: tasksWithSim,
          critical_path: cpm?.criticalPath,
        },
        null,
        2,
      );
      const text = await improvePlanFromGemini(payload);
      setImproveText(text);
    } catch (err) {
      setImproveError(err.message || "Could not improve plan.");
    } finally {
      setImproveLoading(false);
    }
  }, [planData, tasksWithSim, cpm]);

  const handleChatAsk = useCallback(
    async (question) => {
      if (!planData?.tasks?.length) return;
      setChatLoading(true);
      setChatError("");
      setChatReply("");
      try {
        const ctx = JSON.stringify(
          {
            goal: planData.project_goal,
            tasks: tasksWithSim.map((t) => ({
              id: t.id,
              name: t.name,
              depends_on: t.depends_on,
              hours: t.estimated_time_hours,
            })),
            critical_path: cpm?.criticalPath,
            projected_duration: projectedDuration,
          },
          null,
          2,
        );
        const reply = await planChatFromGemini(question, ctx);
        setChatReply(reply);
      } catch (err) {
        setChatError(err.message || "Chat failed.");
      } finally {
        setChatLoading(false);
      }
    },
    [planData, tasksWithSim, cpm, projectedDuration],
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header onMenuToggle={() => setCollapsed((c) => !c)} menuOpen={!collapsed} onRunDemo={runDemo} />

      <div className="flex min-h-0 w-full flex-1 flex-col gap-3 px-3 py-2 md:flex-row md:gap-4 md:px-4 md:py-3">
        <Sidebar
          history={history}
          onSelectPrompt={(entry) => handleGenerate(entry)}
          collapsed={collapsed}
          onClose={() => setCollapsed(true)}
        />

        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain p-2 pb-28 sm:p-4 sm:pb-32 [max-height:calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)]">
          <main className="print-area relative z-0 w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:px-4">
            <MainLayout
              loading={loading}
              planData={planData}
              tasksWithSim={tasksWithSim}
              cpm={cpm}
              sumTaskHours={sumTaskHours}
              projectedDuration={projectedDuration}
              onTaskDurationChange={updateTaskDuration}
              onRemoveSimulatedTask={removeSimulatedTask}
              onAddSimulatedTask={addSimulatedTask}
              bottleneckMessage={bottleneckMessage}
              selectedTaskId={selectedTaskId}
              setSelectedTaskId={setSelectedTaskId}
              fitGraphTick={fitGraphTick}
              onRecalculateGraph={handleRecalculateGraph}
              onTryExample={(example) => {
                setInput(example);
                void handleGenerate(example);
              }}
              onQuickAddAppend={appendToInput}
              onExplainPlan={handleExplainPlan}
              completedTaskIds={completedTaskIds}
              onToggleTaskComplete={onToggleTaskComplete}
              explainLoading={explainLoading}
              explainText={explainText}
              explainError={explainError}
              onClearExplain={clearExplain}
              executionMode={executionMode}
              onStartGuided={startGuided}
              onExitGuided={() => setExecutionMode(false)}
              onGuidedComplete={completeGuidedTask}
              taskDisplayOrder={taskDisplayOrder}
              onTaskDisplayOrderChange={setTaskDisplayOrder}
              risks={risks}
              improveLoading={improveLoading}
              improveText={improveText}
              improveError={improveError}
              onImprovePlan={handleImprovePlan}
              chatLoading={chatLoading}
              chatReply={chatReply}
              chatError={chatError}
              onChatAsk={handleChatAsk}
            />
          </main>
        </div>
      </div>

      <InputBar
        input={input}
        onInputChange={setInput}
        loading={loading}
        onGenerate={handleGenerate}
        error={error}
        inputAnalysis={inputAnalysis}
      />
    </div>
  );
}

export default App;
