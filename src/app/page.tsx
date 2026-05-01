"use client";

import { usePlanner } from "@/context/PlannerProvider";
import {
  addDaysISO,
  formatDisplayDate,
  minutesToLabel,
  startOfWeekISO,
  todayISO,
} from "@/lib/dates";
import {
  completedThisWeek,
  sessionsForDate,
  taskOverdue,
  upcomingDeadlines,
} from "@/lib/selectors";
import Link from "next/link";
import { hrefTask } from "@/lib/taskNav";

export default function DashboardPage() {
  const { subjects, tasks, sessions } = usePlanner();
  const today = todayISO();
  const weekStart = startOfWeekISO(today);
  const weekEnd = addDaysISO(weekStart, 6);

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const todaySessions = sessionsForDate(sessions, today);
  const overdue = tasks.filter((t) => taskOverdue(t, today));
  const upcoming = upcomingDeadlines(tasks, today, 14);
  const doneThisWeek = completedThisWeek(tasks, weekStart, weekEnd);
  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {formatDisplayDate(today)} · {doneThisWeek} task(s) completed this week
          {openCount > 0 ? ` · ${openCount} open` : ""}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Today&apos;s sessions
          </h2>
          {todaySessions.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              Nothing scheduled. Add blocks on{" "}
              <Link href="/schedule" className="text-indigo-600 underline">
                Schedule
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {todaySessions.map((s) => {
                const task = s.taskId
                  ? tasks.find((t) => t.id === s.taskId)
                  : null;
                const sub = task?.subjectId
                  ? subjectMap[task.subjectId]
                  : null;
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {sub && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: sub.color }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">
                        {task ? (
                          <Link
                            href={hrefTask(task.id)}
                            className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                          >
                            {task.title}
                          </Link>
                        ) : (
                          "Unlinked session"
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 text-zinc-500 tabular-nums">
                      {minutesToLabel(s.startMinutes)} –{" "}
                      {minutesToLabel(s.endMinutes)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Overdue
          </h2>
          {overdue.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              You&apos;re caught up on due dates.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {overdue.slice(0, 6).map((t) => {
                const sub = t.subjectId ? subjectMap[t.subjectId] : null;
                return (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    {sub && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: sub.color }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate flex-1">{t.title}</span>
                    <span className="text-rose-600 dark:text-rose-400 shrink-0">
                      {t.dueDate}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Upcoming deadlines (14 days)
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            No deadlines in the next two weeks — or add due dates on{" "}
            <Link href="/tasks" className="text-indigo-600 underline">
              Tasks
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-900">
            {upcoming.map((t) => {
              const sub = t.subjectId ? subjectMap[t.subjectId] : null;
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 py-2 first:pt-0 last:pb-0 text-sm"
                >
                  {sub && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: sub.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1 truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {t.title}
                  </span>
                  <span className="shrink-0 text-zinc-500 tabular-nums">
                    {t.dueDate ? formatDisplayDate(t.dueDate) : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
