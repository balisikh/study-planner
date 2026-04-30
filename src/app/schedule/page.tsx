"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import {
  addDaysISO,
  formatDisplayDate,
  minutesToLabel,
  minutesToTimeInput,
  parseTimeToMinutes,
  startOfWeekISO,
  todayISO,
} from "@/lib/dates";
import type { SessionStatus } from "@/lib/types";

export default function SchedulePage() {
  const {
    subjects,
    tasks,
    sessions,
    upsertSession,
    deleteSession,
  } = usePlanner();
  const today = todayISO();
  const [weekStart, setWeekStart] = useState(() => startOfWeekISO(today));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  }, [weekStart]);

  const [formDate, setFormDate] = useState(today);
  const [formTaskId, setFormTaskId] = useState("");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("10:00");
  const [formStatus, setFormStatus] = useState<SessionStatus>("planned");
  const [editingId, setEditingId] = useState<string | null>(null);

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const sessionsByDate = useMemo(() => {
    const m: Record<string, typeof sessions> = {};
    for (const d of days) m[d] = [];
    for (const s of sessions) {
      if (!m[s.date]) continue;
      m[s.date].push(s);
    }
    for (const d of days) {
      m[d].sort((a, b) => a.startMinutes - b.startMinutes);
    }
    return m;
  }, [sessions, days]);

  function resetForm() {
    setEditingId(null);
    setFormDate(today);
    setFormTaskId("");
    setFormStart("09:00");
    setFormEnd("10:00");
    setFormStatus("planned");
  }

  function startEdit(s: (typeof sessions)[0]) {
    setEditingId(s.id);
    setFormDate(s.date);
    setFormTaskId(s.taskId ?? "");
    setFormStart(minutesToTimeInput(s.startMinutes));
    setFormEnd(minutesToTimeInput(s.endMinutes));
    setFormStatus(s.status);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sm = parseTimeToMinutes(formStart);
    const em = parseTimeToMinutes(formEnd);
    if (sm === null || em === null || em <= sm) return;
    upsertSession({
      id: editingId ?? undefined,
      date: formDate,
      startMinutes: sm,
      endMinutes: em,
      taskId: formTaskId || null,
      status: formStatus,
    });
    resetForm();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Plan study blocks by week. Link a task or leave unlinked.
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

      <form
        onSubmit={submit}
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
      >
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {editingId ? "Edit session" : "New session"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Date</span>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Start</span>
            <input
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">End</span>
            <input
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="text-xs font-medium text-zinc-500">Task</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={formTaskId}
              onChange={(e) => setFormTaskId(e.target.value)}
            >
              <option value="">— Optional —</option>
              {tasks
                .filter((t) => t.status !== "done")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Status</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={formStatus}
              onChange={(e) =>
                setFormStatus(e.target.value as SessionStatus)
              }
            >
              <option value="planned">Planned</option>
              <option value="done">Done</option>
              <option value="missed">Missed</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {editingId ? "Save session" : "Add session"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

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
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatDisplayDate(d)}
                  </div>
                  {isToday && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                      Today
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  onClick={() => {
                    setFormDate(d);
                    setEditingId(null);
                  }}
                >
                  Use in form
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {list.length === 0 ? (
                  <li className="text-sm text-zinc-500">No sessions</li>
                ) : (
                  list.map((s) => {
                    const task = s.taskId
                      ? tasks.find((t) => t.id === s.taskId)
                      : null;
                    const sub = task?.subjectId
                      ? subjectMap[task.subjectId]
                      : null;
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
                          <span className="ml-2 flex items-center gap-1.5">
                            {sub && (
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                            )}
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {task?.title ?? "Unlinked"}
                            </span>
                          </span>
                          <span className="ml-1 text-xs capitalize text-zinc-500">
                            · {s.status}
                          </span>
                        </span>
                        <span className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            onClick={() => startEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs text-rose-600"
                            onClick={() => {
                              if (confirm("Remove this session?"))
                                deleteSession(s.id);
                            }}
                          >
                            Del
                          </button>
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
