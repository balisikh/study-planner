"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import type { Subject, SubjectCategory } from "@/lib/types";
import {
  CUSTOM_ESSENTIAL_SUBJECTS,
  QUALIFICATION_SUBJECT_TEMPLATES,
  type QualificationTemplateId,
  getSuggestedSubjectColorOrPalette,
  normalizeSubjectName,
} from "@/lib/subjectTemplates";

function emptyForm(category: SubjectCategory): Pick<Subject, "name" | "color" | "category"> {
  return { name: "", color: "#6366f1", category };
}

export default function SubjectsPage() {
  const { subjects, upsertSubject, deleteSubject } = usePlanner();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SubjectCategory>("gcse");
  const [form, setForm] = useState(() => emptyForm("gcse"));
  const [templateId, setTemplateId] = useState<QualificationTemplateId>("gcse");
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [moveTo, setMoveTo] = useState<Record<string, SubjectCategory>>({});

  const [feedback, setFeedback] = useState<{
    tone: "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 6500);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const categoryLabels: Record<SubjectCategory, string> = {
    gcse: "GCSE",
    alevel: "A Level",
    btec: "BTEC (L1–L3)",
    codingTraineeship: "Coding Traineeship",
    university: "University",
    custom: "Custom",
  };

  const filteredSubjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      if (s.category !== activeCategory) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q);
    });
  }, [subjects, query, activeCategory]);

  function startEdit(s: Subject) {
    setEditingId(s.id);
    setForm({ name: s.name, color: s.color, category: s.category });
    // Make it obvious that edit mode started.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleRef.current?.focus();
      titleRef.current?.select();
    });
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm(activeCategory));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    upsertSubject({
      id: editingId ?? undefined,
      name: form.name.trim(),
      color: form.color,
      category: form.category ?? activeCategory,
    });
    cancel();
  }

  function addSubjectsFromList(list: string[], category: SubjectCategory): number {
    const existing = new Set(subjects.map((s) => normalizeSubjectName(s.name)));
    let added = 0;
    for (const name of list) {
      const norm = normalizeSubjectName(name);
      if (existing.has(norm)) continue;
      const color = getSuggestedSubjectColorOrPalette(name);
      upsertSubject({ name, color, category });
      existing.add(norm);
      added++;
    }
    setActiveCategory(category);
    return added;
  }

  function addQualificationTemplate() {
    setFeedback(null);
    const list = QUALIFICATION_SUBJECT_TEMPLATES[templateId].subjects;
    const n = addSubjectsFromList(list, templateId as SubjectCategory);
    if (n > 0) {
      setFeedback({ tone: "success", text: `Added ${n} subject(s).` });
    } else {
      setFeedback({
        tone: "info",
        text: "No new subjects — those titles were already in your list.",
      });
    }
  }

  function applySuggestedColorsForActiveCategory() {
    const list = subjects.filter((s) => s.category === activeCategory);
    let changed = 0;
    for (const s of list) {
      const target = getSuggestedSubjectColorOrPalette(s.name);
      if (s.color.toLowerCase() === target.toLowerCase()) continue;
      upsertSubject({
        id: s.id,
        name: s.name,
        color: target,
        category: s.category,
      });
      changed++;
    }
    if (changed > 0) {
      setFeedback({
        tone: "success",
        text: `Updated colours for ${changed} subject(s) in ${categoryLabels[activeCategory]}.`,
      });
    } else {
      setFeedback({
        tone: "info",
        text: `Every subject in ${categoryLabels[activeCategory]} already matches its suggested colour.`,
      });
    }
  }

  function moveSubject(id: string, to: SubjectCategory) {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const targetConflict = subjects.find(
      (x) =>
        x.id !== s.id &&
        normalizeSubjectName(x.name) === normalizeSubjectName(s.name)
    );
    if (targetConflict) {
      alert(
        `Cannot move: “${s.name}” already exists elsewhere. With global unique subjects, move would create a duplicate.`
      );
      return;
    }
    upsertSubject({ id: s.id, name: s.name, color: s.color, category: to });
    setMoveTo((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Subjects
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Subjects help you group tasks and color-code sessions.
        </p>
        {feedback && (
          <p
            className={
              feedback.tone === "success"
                ? "mt-3 text-sm text-emerald-700 dark:text-emerald-400"
                : "mt-3 text-sm text-zinc-600 dark:text-zinc-400"
            }
            role="status"
            aria-live="polite"
          >
            {feedback.text}
          </p>
        )}
      </div>

      <section
        className="flex flex-wrap gap-2"
        role="toolbar"
        aria-label="Subject categories"
      >
        {(Object.keys(categoryLabels) as SubjectCategory[]).map((c) => {
          const active = c === activeCategory;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
              onClick={() => {
                setActiveCategory(c);
                setQuery("");
                setEditingId(null);
                setForm(emptyForm(c));
              }}
            >
              {categoryLabels[c]}
            </button>
          );
        })}
      </section>

      {activeCategory !== "custom" && (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Quick add templates
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label htmlFor="qual-template-select" className="sr-only">
              Qualification subject template
            </label>
            <select
              id="qual-template-select"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 sm:min-w-[14rem]"
              value={templateId}
              onChange={(e) =>
                setTemplateId(e.target.value as QualificationTemplateId)
              }
            >
              {(
                Object.keys(
                  QUALIFICATION_SUBJECT_TEMPLATES
                ) as QualificationTemplateId[]
              ).map((id) => (
                <option key={id} value={id}>
                  {QUALIFICATION_SUBJECT_TEMPLATES[id].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              onClick={addQualificationTemplate}
            >
              Add subjects
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              onClick={() => {
                setFeedback(null);
                applySuggestedColorsForActiveCategory();
              }}
            >
              Apply colours
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Add what you study as subjects, then create tasks on the Tasks page and schedule them.
            Apply colours uses subject hints where we have them, otherwise a stable colour from the
            title.
          </p>
        </section>
      )}

      {activeCategory === "custom" && (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Custom starters
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Short courses, UCAS prep, multi-subject revision, and driving — add them as subjects,
            then add your own tasks.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              onClick={() => {
                setFeedback(null);
                const n = addSubjectsFromList(CUSTOM_ESSENTIAL_SUBJECTS, "custom");
                if (n > 0) {
                  setFeedback({ tone: "success", text: `Added ${n} starter subject(s).` });
                } else {
                  setFeedback({
                    tone: "info",
                    text: "No new starters — those titles were already in your list.",
                  });
                }
              }}
            >
              Add starter subjects
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              onClick={() => {
                setFeedback(null);
                applySuggestedColorsForActiveCategory();
              }}
            >
              Apply colours
            </button>
          </div>
        </section>
      )}

      <form
        ref={formRef}
        onSubmit={submit}
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
      >
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {editingId ? "Edit subject" : "New subject"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Name *</span>
            <input
              required
              ref={titleRef}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Category</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as SubjectCategory })
              }
            >
              {(Object.keys(categoryLabels) as SubjectCategory[]).map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Color</span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                aria-label="Subject colour"
                className="h-10 w-12 rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
              <span className="text-xs text-zinc-500">{form.color}</span>
            </div>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {editingId ? "Save" : "Add subject"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-sm" htmlFor="subject-search">
          <span className="text-xs font-medium text-zinc-500">Search</span>
          <input
            id="subject-search"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Type to filter subjects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
      </section>

      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200/80 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {subjects.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-zinc-500">
            No subjects yet.
          </li>
        ) : filteredSubjects.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-zinc-500">
            {query.trim()
              ? `No results for “${query.trim()}”.`
              : `No subjects in ${categoryLabels[activeCategory]} yet.`}
          </li>
        ) : (
          filteredSubjects.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 px-5 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {s.name}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                {activeCategory === "custom" && (
                  <>
                    <select
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      value={moveTo[s.id] ?? "gcse"}
                      onChange={(e) =>
                        setMoveTo((p) => ({
                          ...p,
                          [s.id]: e.target.value as SubjectCategory,
                        }))
                      }
                      aria-label="Move subject to category"
                    >
                      <option value="gcse">GCSE</option>
                      <option value="alevel">A Level</option>
                      <option value="btec">BTEC (L1–L3)</option>
                      <option value="codingTraineeship">Coding Traineeship</option>
                      <option value="university">University</option>
                    </select>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                      onClick={() => moveSubject(s.id, moveTo[s.id] ?? "gcse")}
                    >
                      Move
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Delete this subject? Tasks will become unassigned."
                      )
                    )
                      deleteSubject(s.id);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

