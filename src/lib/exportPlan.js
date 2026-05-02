export function buildTasksCsv(tasks) {
  const header = "id,name,depends_on,hours,priority";
  const rows = (tasks || []).map((t) => {
    const name = (t.name || "").replace(/"/g, '""');
    const deps = (t.depends_on || []).join(";");
    return [t.id, `"${name}"`, `"${deps}"`, t.estimated_time_hours, t.priority].join(",");
  });
  return [header, ...rows].join("\n");
}

export function buildPlanClipboardPayload(planData, tasks) {
  return JSON.stringify(
    {
      project_goal: planData?.project_goal,
      tasks: (tasks || []).map((t) => ({
        id: t.id,
        name: t.name,
        depends_on: t.depends_on,
        estimated_time_hours: t.estimated_time_hours,
        priority: t.priority,
      })),
    },
    null,
    2,
  );
}

export function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}
