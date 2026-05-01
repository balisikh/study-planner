"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import type { Priority, SubjectCategory, Task, TaskStatus } from "@/lib/types";
import { formatDisplayDate } from "@/lib/dates";
import { taskOverdue } from "@/lib/selectors";
import { todayISO } from "@/lib/dates";
import { parseTaskHash } from "@/lib/taskNav";

const priorities: Priority[] = ["low", "medium", "high"];
const statuses: TaskStatus[] = ["todo", "doing", "done"];

function emptyForm(): Omit<Task, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    subjectId: null,
    dueDate: null,
    priority: "medium",
    estimateMinutes: null,
    notes: "",
    status: "todo",
    completedAt: null,
  };
}

export default function TasksPage() {
  const {
    subjects,
    tasks,
    upsertTask,
    deleteTask,
  } = usePlanner();
  const today = todayISO();
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("open");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [pulseTaskId, setPulseTaskId] = useState<string | null>(null);
  const appliedTaskHashRef = useRef<string>("");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterSubject !== "all" && t.subjectId !== filterSubject) return false;
      if (filterStatus === "open" && t.status === "done") return false;
      if (filterStatus === "done" && t.status !== "done") return false;
      if (filterStatus === "todo" && t.status !== "todo") return false;
      if (filterStatus === "doing" && t.status !== "doing") return false;
      return true;
    });
  }, [tasks, filterSubject, filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ad = a.dueDate || "9999-12-31";
      const bd = b.dueDate || "9999-12-31";
      if (ad !== bd) return ad < bd ? -1 : 1;
      const pr: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return pr[a.priority] - pr[b.priority];
    });
  }, [filtered]);

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const subjectGroups = useMemo(() => {
    const labels: Record<SubjectCategory, string> = {
      gcse: "GCSE",
      alevel: "A Level",
      btec: "BTEC (L1–L3)",
      codingTraineeship: "Coding Traineeship",
      university: "University",
      custom: "Custom",
    };
    const groups: Record<SubjectCategory, typeof subjects> = {
      gcse: [],
      alevel: [],
      btec: [],
      codingTraineeship: [],
      university: [],
      custom: [],
    };
    for (const s of subjects) groups[s.category].push(s);
    for (const k of Object.keys(groups) as SubjectCategory[]) {
      groups[k].sort((a, b) => a.name.localeCompare(b.name));
    }
    return { labels, groups };
  }, [subjects]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    const id = parseTaskHash(h);
    if (!id || !tasks.some((t) => t.id === id)) return;
    if (appliedTaskHashRef.current === h) return;
    appliedTaskHashRef.current = h;
    setFilterSubject("all");
    setFilterStatus("all");
  }, [tasks]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = parseTaskHash(window.location.hash);
    if (!id || !sorted.some((t) => t.id === id)) return;
    const el = document.getElementById(`task-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* ignore */
    }
    setPulseTaskId(id);
    const tid = window.setTimeout(() => setPulseTaskId(null), 2800);
    return () => window.clearTimeout(tid);
  }, [sorted]);

  useEffect(() => {
    function onHash() {
      const h = window.location.hash;
      const id = parseTaskHash(h);
      appliedTaskHashRef.current = "";
      if (!id || !tasks.some((t) => t.id === id)) return;
      appliedTaskHashRef.current = h;
      setFilterSubject("all");
      setFilterStatus("all");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const el = document.getElementById(`task-${id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          setPulseTaskId(id);
          window.setTimeout(() => setPulseTaskId(null), 2800);
        });
      });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [tasks]);

  function startEdit(t: Task) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      subjectId: t.subjectId,
      dueDate: t.dueDate,
      priority: t.priority,
      estimateMinutes: t.estimateMinutes,
      notes: t.notes,
      status: t.status,
      completedAt: t.completedAt,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    upsertTask({
      ...form,
      id: editingId ?? undefined,
    });
    cancelEdit();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Capture work with due dates and priorities. Open tasks exclude completed ones by default.
          From Schedule or Dashboard, open a linked session&apos;s task title to jump here.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
      >
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {editingId ? "Edit task" : "New task"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-zinc-500">Title *</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Subject</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.subjectId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  subjectId: e.target.value || null,
                })
              }
            >
              <option value="">— None —</option>
              {(Object.keys(subjectGroups.groups) as SubjectCategory[]).map(
                (cat) => {
                  const list = subjectGroups.groups[cat];
                  if (list.length === 0) return null;
                  return (
                    <optgroup key={cat} label={subjectGroups.labels[cat]}>
                      {list.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                }
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Due date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.dueDate ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value || null,
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Priority</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as Priority })
              }
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">
              Estimate (minutes)
            </span>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.estimateMinutes ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimateMinutes: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Status</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as TaskStatus })
              }
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-zinc-500">Notes</span>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {editingId ? "Save" : "Add task"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <label htmlFor="task-filter-subject" className="sr-only">
          Filter tasks by subject
        </label>
        <select
          id="task-filter-subject"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="task-filter-status" className="sr-only">
          Filter tasks by status
        </label>
        <select
          id="task-filter-status"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="open">Open (not done)</option>
          <option value="todo">Todo only</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
          <option value="all">All statuses</option>
        </select>
      </div>

      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200/80 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {sorted.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-zinc-500">
            No tasks match filters.
          </li>
        ) : (
          sorted.map((t) => {
            const sub = t.subjectId ? subjectMap[t.subjectId] : null;
            const overdue = taskOverdue(t, today);
            return (
              <li
                key={t.id}
                id={`task-${t.id}`}
                tabIndex={-1}
                className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between outline-none scroll-mt-24 ${
                  pulseTaskId === t.id
                    ? "ring-2 ring-indigo-500 ring-inset bg-indigo-50/40 dark:bg-indigo-950/25"
                    : ""
                }`}
              >
                <div className="min-w-0 flex items-start gap-3">
                  {sub && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: sub.color }}
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {t.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="capitalize">{t.priority}</span>
                      {t.dueDate && (
                        <span className={overdue ? "text-rose-600 dark:text-rose-400" : ""}>
                          Due {formatDisplayDate(t.dueDate)}
                          {overdue ? " · overdue" : ""}
                        </span>
                      )}
                      <span className="capitalize">{t.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this task?")) deleteTask(t.id);
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
