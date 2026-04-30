"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import type { Priority, Task, TaskStatus } from "@/lib/types";
import { formatDisplayDate } from "@/lib/dates";
import { taskOverdue } from "@/lib/selectors";
import { todayISO } from "@/lib/dates";

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
          Capture work with due dates and priorities. Open tasks exclude
          completed ones by default.
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
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
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
        <select
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
        <select
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
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex items-start gap-3">
                  {sub && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: sub.color }}
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
