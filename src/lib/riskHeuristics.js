/** Lightweight risk signals from task names + CPM (no extra LLM call). */
export function analyzeRisks(tasks, cpm) {
  const risks = [];
  const seen = new Set();

  for (const t of tasks || []) {
    const name = (t.name || "").toLowerCase();
    const key = `${t.id}-ext`;
    if (
      /payment|billing|checkout|stripe|pci|oauth|third[-\s]?party|external\s*api|webhook/.test(
        name,
      ) &&
      !seen.has(key)
    ) {
      seen.add(key);
      risks.push({
        level: "high",
        title: t.name,
        detail:
          "May depend on external APIs, vendors, or compliance (payments, auth) — schedule buffer and staging tests.",
      });
    }
    if (/security|auth|encryption|gdpr|hipaa/.test(name) && !seen.has(`${t.id}-sec`)) {
      seen.add(`${t.id}-sec`);
      risks.push({
        level: "medium",
        title: t.name,
        detail: "Security or compliance work can expand scope; validate requirements early.",
      });
    }
    if (/integrat|migration|legacy/.test(name) && !seen.has(`${t.id}-int`)) {
      seen.add(`${t.id}-int`);
      risks.push({
        level: "medium",
        title: t.name,
        detail: "Integrations often surface unknown dependencies — keep a rollback plan.",
      });
    }
  }

  const bottleneckId = cpm?.bottlenecks?.[0];
  if (bottleneckId) {
    const task = tasks.find((x) => x.id === bottleneckId);
    if (task) {
      risks.push({
        level: "medium",
        title: `Bottleneck: ${task.name}`,
        detail: "This task sits on the critical path — delays here delay project completion.",
      });
    }
  }

  return risks;
}
