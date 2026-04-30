"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import {
  addDaysISO,
  formatDisplayDate,
  minutesToLabel,
  startOfWeekISO,
  todayISO,
} from "@/lib/dates";

export default function TimetablePage() {
  const { subjects, tasks, sessions } = usePlanner();
  const today = todayISO();
  const [weekStart, setWeekStart] = useState(() => startOfWeekISO(today));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)),
    [weekStart]
  );

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s] as const)),
    [subjects]
  );

  const taskMap = useMemo(
    () => Object.fromEntries(tasks.map((t) => [t.id, t] as const)),
    [tasks]
  );

  const sessionsByDate = useMemo(() => {
    const m: Record<string, typeof sessions> = {};
    for (const d of days) m[d] = [];
    for (const s of sessions) {
      if (!m[s.date]) continue;
      m[s.date].push(s);
    }
    for (const d of days) m[d].sort((a, b) => a.startMinutes - b.startMinutes);
    return m;
  }, [sessions, days]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Revision timetable
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            This is a timetable view of your planned study sessions. To add or
            change sessions, use{" "}
            <Link href="/schedule" className="text-indigo-600 underline">
              Schedule
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            onClick={() => setWeekStart((w) => addDaysISO(w, -7))}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            onClick={() => setWeekStart(startOfWeekISO(today))}
          >
            This week
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            onClick={() => setWeekStart((w) => addDaysISO(w, 7))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {days.map((d) => {
          const list = sessionsByDate[d] ?? [];
          const isToday = d === today;
          return (
            <div
              key={d}
              className={`rounded-2xl border p-4 ${
                isToday
                  ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
                  : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatDisplayDate(d)}
                </div>
                {isToday && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    Today
                  </div>
                )}
              </div>

              <ul className="mt-3 space-y-2">
                {list.length === 0 ? (
                  <li className="text-sm text-zinc-500">No sessions</li>
                ) : (
                  list.map((s) => {
                    const task = s.taskId ? taskMap[s.taskId] : undefined;
                    const sub =
                      task?.subjectId ? subjectMap[task.subjectId] : undefined;
                    return (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="tabular-nums text-zinc-500">
                            {minutesToLabel(s.startMinutes)}–
                            {minutesToLabel(s.endMinutes)}
                          </span>
                          <span className="ml-2 inline-flex items-center gap-1.5">
                            {sub && (
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                            )}
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {task?.title ?? "Unlinked session"}
                            </span>
                          </span>
                          <span className="ml-1 text-xs capitalize text-zinc-500">
                            · {s.status}
                          </span>
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

