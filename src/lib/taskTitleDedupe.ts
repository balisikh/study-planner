import { normalizeSubjectName } from "@/lib/subjectTemplates";
import type { Task } from "@/lib/types";

export type DuplicateTitleGroup = {
  normalizedKey: string;
  tasks: Task[];
};

/** Groups tasks that share the same normalized title (two or more tasks per group). */
export function findDuplicateTitleGroups(tasks: readonly Task[]): DuplicateTitleGroup[] {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const k = normalizeSubjectName(t.title.trim());
    if (!k) continue;
    let arr = map.get(k);
    if (!arr) {
      arr = [];
      map.set(k, arr);
    }
    arr.push(t);
  }
  const out: DuplicateTitleGroup[] = [];
  for (const [normalizedKey, groupTasks] of map) {
    if (groupTasks.length < 2) continue;
    out.push({
      normalizedKey,
      tasks: [...groupTasks].sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
      ),
    });
  }
  out.sort((a, b) => a.normalizedKey.localeCompare(b.normalizedKey));
  return out;
}

/**
 * Planner-wide task title uniqueness uses the same normalization as topic checklists
 * (spacing and letter case).
 */
export function findConflictingTaskTitle(
  tasks: readonly Task[],
  rawTitle: string,
  options?: { excludeTaskId?: string }
): Task | undefined {
  const key = normalizeSubjectName(rawTitle.trim());
  if (!key) return undefined;
  const ex = options?.excludeTaskId;
  return tasks.find((t) => {
    if (ex !== undefined && t.id === ex) return false;
    return normalizeSubjectName(t.title) === key;
  });
}
