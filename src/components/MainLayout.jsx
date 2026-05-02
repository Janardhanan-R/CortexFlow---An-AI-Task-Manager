import { useEffect, useMemo, useState } from "react";
import { deriveHtnPhases, normalizeHtnFromPlan } from "../lib/dashboardView";
import { getTopoOrderIds } from "../lib/taskNavigation";
import { CPMSchedule } from "./CPMSchedule.jsx";
import { CriticalPathSection } from "./CriticalPathSection.jsx";
import { EmptyDashboard } from "./EmptyDashboard.jsx";
import { ExecutionProgressBar } from "./ExecutionProgressBar.jsx";
import { ExplainPlanSection } from "./ExplainPlanSection.jsx";
import { ExportToolbar } from "./ExportToolbar.jsx";
import { GuidedExecutionPanel } from "./GuidedExecutionPanel.jsx";
import { HTNPhases } from "./HTNPhases.jsx";
import { ImprovePlanCard } from "./ImprovePlanCard.jsx";
import { IntentSummarySection } from "./IntentSummarySection.jsx";
import { ParallelTasksSection } from "./ParallelTasksSection.jsx";
import { QuickAddSuggestions } from "./QuickAddSuggestions.jsx";
import { PlanChatPanel } from "./PlanChatPanel.jsx";
import { RiskPanel } from "./RiskPanel.jsx";
import { SortableTaskOrder } from "./SortableTaskOrder.jsx";
import { TaskTracker } from "./TaskTracker.jsx";
import { WhatIfPanel } from "./WhatIfPanel.jsx";
import { WorkflowFlowchart } from "./WorkflowFlowchart.jsx";
import { WorkflowLoadingSkeleton } from "./WorkflowLoadingSkeleton.jsx";
import { btnIndigoPill } from "../lib/buttonClasses.js";

const TABS = [
  { id: "planning", label: "Planning", emoji: "📊" },
  { id: "scheduling", label: "Scheduling", emoji: "⏱️" },
  { id: "execution", label: "Execution", emoji: "🔄" },
  { id: "ai", label: "AI Insights", emoji: "🤖" },
];

export function MainLayout({
  loading = false,
  planData,
  tasksWithSim,
  cpm,
  sumTaskHours,
  projectedDuration,
  onTaskDurationChange,
  onRemoveSimulatedTask,
  onAddSimulatedTask,
  bottleneckMessage,
  selectedTaskId,
  setSelectedTaskId,
  fitGraphTick,
  onRecalculateGraph,
  onTryExample,
  onQuickAddAppend,
  onExplainPlan,
  completedTaskIds,
  onToggleTaskComplete,
  explainLoading,
  explainText,
  explainError,
  onClearExplain,
  executionMode,
  onStartGuided,
  onExitGuided,
  onGuidedComplete,
  taskDisplayOrder,
  onTaskDisplayOrderChange,
  risks,
  improveLoading,
  improveText,
  improveError,
  onImprovePlan,
  chatLoading,
  chatReply,
  chatError,
  onChatAsk,
}) {
  const [activeTab, setActiveTab] = useState("planning");

  const phases = useMemo(() => {
    if (!planData?.tasks?.length) {
      return deriveHtnPhases([]);
    }
    const fromLlm = normalizeHtnFromPlan(planData);
    if (fromLlm?.length) return fromLlm;
    return deriveHtnPhases(planData.tasks);
  }, [planData]);

  const criticalTasks = useMemo(() => {
    const ids = cpm?.criticalPath?.length
      ? cpm.criticalPath
      : planData?.time_estimation?.critical_path || [];
    const map = new Map((tasksWithSim || []).map((t) => [t.id, t]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }, [planData, cpm, tasksWithSim]);

  const criticalPathNames = useMemo(
    () => criticalTasks.map((t) => t.name),
    [criticalTasks],
  );

  const topoOrder = useMemo(() => getTopoOrderIds(tasksWithSim), [tasksWithSim]);

  const resolvedDisplayOrder = useMemo(() => {
    if (!tasksWithSim?.length) return [];
    if (
      Array.isArray(taskDisplayOrder) &&
      taskDisplayOrder.length === tasksWithSim.length &&
      taskDisplayOrder.every((id) => tasksWithSim.some((t) => t.id === id))
    ) {
      return taskDisplayOrder;
    }
    return topoOrder;
  }, [taskDisplayOrder, tasksWithSim, topoOrder]);

  const completedCount =
    completedTaskIds instanceof Set
      ? completedTaskIds.size
      : new Set(completedTaskIds || []).size;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  if (loading) {
    return <WorkflowLoadingSkeleton />;
  }

  if (!planData?.tasks?.length) {
    return <EmptyDashboard onTryExample={onTryExample} />;
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">Structured workflow view</p>

      <ExportToolbar planData={planData} tasks={tasksWithSim} />

      <ExecutionProgressBar completed={completedCount} total={tasksWithSim.length} />

      <div className="-mx-1 flex gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap border-b border-slate-200 px-1 pb-px dark:border-slate-700 sm:gap-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 ${
                isActive
                  ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span className="mr-1.5" aria-hidden>
                {tab.emoji}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 min-w-0 w-full flex-col gap-4 transition-opacity duration-200">
        {activeTab === "planning" && (
          <div className="flex w-full flex-col gap-4">
            <IntentSummarySection
              planData={planData}
              totalHours={sumTaskHours}
              projectedDuration={projectedDuration}
            />
            <QuickAddSuggestions onAppend={onQuickAddAppend} />
            <HTNPhases
              phases={phases}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
            <CriticalPathSection taskNames={criticalPathNames} />
          </div>
        )}

        {activeTab === "scheduling" && (
          <div className="flex w-full min-h-0 flex-col gap-4">
            <div className="grid w-full grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 lg:items-start">
              <div className="min-h-0 min-w-0">
                <CPMSchedule
                  tasks={tasksWithSim}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                />
              </div>
              <div className="min-h-0 min-w-0">
                <ParallelTasksSection planData={planData} tasks={tasksWithSim} />
              </div>
            </div>
            <WhatIfPanel
              tasks={tasksWithSim}
              sumTaskHours={sumTaskHours}
              projectedDuration={projectedDuration}
              onDurationChange={onTaskDurationChange}
              onRecalculate={onRecalculateGraph}
              bottleneckMessage={bottleneckMessage}
              onRemoveTask={onRemoveSimulatedTask}
              onAddTask={onAddSimulatedTask}
            />
          </div>
        )}

        {activeTab === "execution" && (
          <div className="flex w-full flex-col gap-4">
            <GuidedExecutionPanel
              tasks={tasksWithSim}
              completedIds={completedTaskIds}
              executionActive={executionMode}
              onStart={onStartGuided}
              onExit={onExitGuided}
              onMarkCurrentComplete={onGuidedComplete}
            />
            <div className="w-full min-w-0 overflow-x-auto rounded-xl">
              <WorkflowFlowchart
                tasks={tasksWithSim}
                cpm={cpm}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                completedTaskIds={completedTaskIds}
                flowReloadKey={fitGraphTick}
              />
            </div>
            <SortableTaskOrder
              tasks={tasksWithSim}
              orderIds={resolvedDisplayOrder}
              onOrderChange={onTaskDisplayOrderChange}
            />
            <TaskTracker
              tasks={tasksWithSim}
              completedIds={completedTaskIds}
              onToggleComplete={onToggleTaskComplete}
              onSelectTask={setSelectedTaskId}
              selectedTaskId={selectedTaskId}
              displayOrder={resolvedDisplayOrder}
            />
          </div>
        )}

        {activeTab === "ai" && (
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  AI explanation
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Plain-language summary of your workflow
                </p>
              </div>
              <button
                type="button"
                onClick={onExplainPlan}
                disabled={!planData?.tasks?.length || explainLoading}
                className={`${btnIndigoPill} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
              >
                {explainLoading ? "Explaining…" : "Explain plan"}
              </button>
            </div>

            <ExplainPlanSection
              loading={explainLoading}
              text={explainText}
              error={explainError}
              onClear={onClearExplain}
            />

            <ImprovePlanCard
              text={improveText}
              loading={improveLoading}
              error={improveError}
              onImprove={onImprovePlan}
              disabled={!planData?.tasks?.length}
            />

            <RiskPanel risks={risks} />

            <PlanChatPanel
              onAsk={onChatAsk}
              loading={chatLoading}
              lastReply={chatReply}
              error={chatError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
