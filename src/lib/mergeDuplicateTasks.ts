import type { Priority, Task, TaskStatus } from "@/lib/types";

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const statusRank: Record<TaskStatus, number> = { todo: 0, doing: 1, done: 2 };

function mergeNotesPreserveOrder(tasks: readonly Task[]): string {
  const parts = tasks.map((t) => t.notes.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out.join("\n\n---\n\n");
}

function mergeEstimateMinutes(tasks: readonly Task[]): number | null {
  let max: number | null = null;
  for (const t of tasks) {
    if (t.estimateMinutes != null && t.estimateMinutes > 0) {
      max = max === null ? t.estimateMinutes : Math.max(max, t.estimateMinutes);
    }
  }
  return max;
}

function mergeDueDateEarliest(tasks: readonly Task[]): string | null {
  const dates = tasks
    .map((t) => t.dueDate)
    .filter((d): d is string => typeof d === "string" && d.length > 0);
  return dates.length ? [...dates].sort()[0] : null;
}

function mergeSubjectId(tasks: readonly Task[]): string | null {
  for (const t of tasks) {
    if (t.subjectId) return t.subjectId;
  }
  return null;
}

function mergePriorityStrongest(tasks: readonly Task[]): Priority {
  let best = tasks[0]?.priority ?? "medium";
  for (const t of tasks) {
    if (priorityRank[t.priority] < priorityRank[best]) best = t.priority;
  }
  return best;
}

function mergeStatusAndCompletedAt(tasks: readonly Task[]): {
  status: TaskStatus;
  completedAt: string | null;
} {
  let status: TaskStatus = "todo";
  for (const t of tasks) {
    if (statusRank[t.status] > statusRank[status]) status = t.status;
  }
  if (status !== "done") {
    return { status, completedAt: null };
  }
  const stamps = tasks
    .filter((t) => t.completedAt)
    .map((t) => t.completedAt as string);
  const completedAt = stamps.length ? [...stamps].sort().slice(-1)[0]! : null;
  return { status: "done", completedAt };
}

/**
 * Combine duplicate rows into field values for the keeper task (same rules as Settings dedupe).
 * Tasks should include the keeper first, then others; caller supplies order via array.
 */
export function mergeDuplicateTasksFields(
  keeper: Task,
  duplicates: readonly Task[]
): Pick<
  Task,
  | "title"
  | "subjectId"
  | "dueDate"
  | "priority"
  | "estimateMinutes"
  | "notes"
  | "status"
  | "completedAt"
> {
  const ordered = [keeper, ...duplicates].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  const { status, completedAt } = mergeStatusAndCompletedAt(ordered);

  return {
    title: keeper.title.trim(),
    subjectId: keeper.subjectId ?? mergeSubjectId(ordered),
    dueDate: mergeDueDateEarliest(ordered),
    priority: mergePriorityStrongest(ordered),
    estimateMinutes: mergeEstimateMinutes(ordered),
    notes: mergeNotesPreserveOrder(ordered),
    status,
    completedAt,
  };
}
