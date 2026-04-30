import type { StudySession, Task } from "./types";
import { addDaysISO } from "./dates";

export function taskOverdue(t: Task, today: string): boolean {
  if (t.status === "done" || !t.dueDate) return false;
  return t.dueDate < today;
}

export function upcomingDeadlines(
  tasks: Task[],
  today: string,
  withinDays: number
): Task[] {
  const end = addDaysISO(today, withinDays);
  return tasks
    .filter(
      (t) =>
        t.status !== "done" &&
        t.dueDate &&
        t.dueDate >= today &&
        t.dueDate <= end
    )
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));
}

export function sessionsForDate(
  sessions: StudySession[],
  date: string
): StudySession[] {
  return sessions
    .filter((s) => s.date === date)
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

export function completedThisWeek(
  tasks: Task[],
  weekStart: string,
  weekEndInclusive: string
): number {
  return tasks.filter((t) => {
    if (t.status !== "done" || !t.completedAt) return false;
    const d = t.completedAt.slice(0, 10);
    return d >= weekStart && d <= weekEndInclusive;
  }).length;
}
