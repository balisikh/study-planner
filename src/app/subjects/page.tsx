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
import {
  applyConceptTasksForSubject,
  estimateConceptTasksForSubjectNames,
  estimateTopicTasksForSubjects,
  getDedupedConceptTaskTitles,
} from "@/lib/subjectConceptTasks";

function emptyForm(category: SubjectCategory): Pick<Subject, "name" | "color" | "category"> {
  return { name: "", color: "#6366f1", category };
}

export default function SubjectsPage() {
  const { subjects, tasks, upsertSubject, upsertTask, deleteSubject } = usePlanner();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SubjectCategory>("gcse");
  const [form, setForm] = useState(() => emptyForm("gcse"));
  const [templateId, setTemplateId] = useState<QualificationTemplateId>("gcse");
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  type BulkPrompt =
    | null
    | "template-with-topics"
    | "custom-starters-with-topics"
    | "custom-fill-topics";

  const [bulkPrompt, setBulkPrompt] = useState<BulkPrompt>(null);
  const [topicChecklistSubject, setTopicChecklistSubject] = useState<Subject | null>(
    null
  );

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

  const templateBulkList = QUALIFICATION_SUBJECT_TEMPLATES[templateId].subjects;
  const templateBulkEstTasks = estimateConceptTasksForSubjectNames(
    templateId as SubjectCategory,
    templateBulkList
  );

  const customSubjectsOnly = useMemo(
    () => subjects.filter((s) => s.category === "custom"),
    [subjects]
  );

  const customFillEstTasks = useMemo(
    () => estimateTopicTasksForSubjects(customSubjectsOnly),
    [customSubjectsOnly]
  );

  const customStartersEstTasks = useMemo(
    () =>
      estimateConceptTasksForSubjectNames("custom", CUSTOM_ESSENTIAL_SUBJECTS),
    []
  );

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
    const id = upsertSubject({
      id: editingId ?? undefined,
      name: form.name.trim(),
      color: form.color,
      category: form.category ?? activeCategory,
    });
    if (id === undefined) {
      setFeedback({
        tone: "info",
        text: editingId
          ? "Another subject already uses that name. Try a different name."
          : "A subject with that name already exists.",
      });
      return;
    }
    cancel();
  }

  function addSubjectsFromList(
    list: string[],
    category: SubjectCategory
  ): { created: { id: string; name: string }[] } {
    const existing = new Set(subjects.map((s) => normalizeSubjectName(s.name)));
    const created: { id: string; name: string }[] = [];
    for (const name of list) {
      const norm = normalizeSubjectName(name);
      if (existing.has(norm)) continue;
      const color = getSuggestedSubjectColorOrPalette(name);
      const id = upsertSubject({ name, color, category });
      if (id) {
        existing.add(norm);
        created.push({ id, name });
      }
    }
    setActiveCategory(category);
    return { created };
  }

  function addQualificationTemplate() {
    setFeedback(null);
    const list = QUALIFICATION_SUBJECT_TEMPLATES[templateId].subjects;
    const { created } = addSubjectsFromList(list, templateId as SubjectCategory);
    if (created.length > 0) {
      setFeedback({ tone: "success", text: `Added ${created.length} subject(s).` });
    } else {
      setFeedback({
        tone: "info",
        text: "No new subjects — those titles were already in your list.",
      });
    }
  }

  function runTemplateSubjectsWithTopics() {
    const cat = templateId as SubjectCategory;
    const list = QUALIFICATION_SUBJECT_TEMPLATES[templateId].subjects;
    const { created } = addSubjectsFromList(list, cat);
    const plannerTitles = new Set(
      tasks.map((t) => normalizeSubjectName(t.title))
    );
    let tasksAdded = 0;
    for (const { id, name } of created) {
      tasksAdded += applyConceptTasksForSubject(
        { id, name, category: cat },
        tasks,
        upsertTask,
        { sharedPlannerTitles: plannerTitles }
      );
    }
    setBulkPrompt(null);
    setFeedback({
      tone: "success",
      text: `Added ${created.length} new subject(s) and ${tasksAdded} new task(s).`,
    });
  }

  function runCustomStartersWithTopics() {
    const list = CUSTOM_ESSENTIAL_SUBJECTS;
    const { created } = addSubjectsFromList(list, "custom");
    const plannerTitles = new Set(
      tasks.map((t) => normalizeSubjectName(t.title))
    );
    let tasksAdded = 0;
    for (const { id, name } of created) {
      tasksAdded += applyConceptTasksForSubject(
        { id, name, category: "custom" },
        tasks,
        upsertTask,
        { sharedPlannerTitles: plannerTitles }
      );
    }
    setBulkPrompt(null);
    setFeedback({
      tone: "success",
      text: `Added ${created.length} starter subject(s) and ${tasksAdded} new task(s).`,
    });
  }

  function runCustomFillAllTopics() {
    const list = subjects.filter((s) => s.category === "custom");
    const plannerTitles = new Set(
      tasks.map((t) => normalizeSubjectName(t.title))
    );
    let tasksAdded = 0;
    for (const s of list) {
      tasksAdded += applyConceptTasksForSubject(s, tasks, upsertTask, {
        sharedPlannerTitles: plannerTitles,
      });
    }
    setBulkPrompt(null);
    setFeedback({
      tone: "success",
      text: `Added ${tasksAdded} task(s) across Custom subjects (titles already used anywhere were skipped).`,
    });
  }

  function openTopicChecklistPreview(s: Subject) {
    const titles = getDedupedConceptTaskTitles(s.category, s.name);
    if (titles.length === 0) {
      setFeedback({
        tone: "info",
        text: "No built-in topic checklist for this subject.",
      });
      return;
    }
    setTopicChecklistSubject(s);
  }

  function confirmAddTopicsFromPreview() {
    if (!topicChecklistSubject) return;
    const added = applyConceptTasksForSubject(
      topicChecklistSubject,
      tasks,
      upsertTask,
      { dedupeAcrossPlanner: false }
    );
    setTopicChecklistSubject(null);
    if (added === 0) {
      setFeedback({
        tone: "info",
        text: `No new tasks — every checklist line is already a task on this subject.`,
      });
    } else {
      setFeedback({
        tone: "success",
        text: `Added ${added} new task(s) on this subject (skipped lines already on this subject).`,
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
                setBulkPrompt(null);
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
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
              onClick={() => {
                setFeedback(null);
                setBulkPrompt("template-with-topics");
              }}
            >
              Add subjects + topic tasks
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
          {bulkPrompt === "template-with-topics" && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3"
              role="region"
              aria-label="Confirm add subjects and topic tasks"
            >
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                Add up to {templateBulkList.length} subjects from this template and about{" "}
                {templateBulkEstTasks} topic tasks if every row were new. Existing subjects are
                skipped; task titles already used anywhere in Tasks are skipped (no duplicate titles).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  onClick={() => {
                    setFeedback(null);
                    runTemplateSubjectsWithTopics();
                  }}
                >
                  Yes, add subjects and topics
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setBulkPrompt(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Templates match GCSE, A Level, BTEC (L1–L3), Coding Traineeship, and University naming.
            Add subjects only, or add subjects plus starter topic tasks. Use{" "}
            <span className="font-medium text-zinc-600 dark:text-zinc-300">Topics</span> on a row to
            add checklist tasks for one subject. Apply colours uses hints from the title where we
            have them.
          </p>
        </section>
      )}

      {activeCategory === "custom" && (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Custom starters
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Short courses, UCAS prep, revision themes, and driving — each starter has a matching
            topic checklist you can add in bulk.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              onClick={() => {
                setFeedback(null);
                const { created } = addSubjectsFromList(CUSTOM_ESSENTIAL_SUBJECTS, "custom");
                if (created.length > 0) {
                  setFeedback({
                    tone: "success",
                    text: `Added ${created.length} starter subject(s).`,
                  });
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
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
              onClick={() => {
                setFeedback(null);
                setBulkPrompt("custom-starters-with-topics");
              }}
            >
              Add starters + topic tasks
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              onClick={() => {
                setFeedback(null);
                setBulkPrompt("custom-fill-topics");
              }}
            >
              Fill topics for all Custom subjects
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
          {bulkPrompt === "custom-starters-with-topics" && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3"
              role="region"
              aria-label="Confirm add starter subjects with topics"
            >
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                Add {CUSTOM_ESSENTIAL_SUBJECTS.length} starter subjects and about{" "}
                {customStartersEstTasks} topic tasks if every starter were new. Existing subjects
                are skipped; task titles already used anywhere are skipped (no duplicate titles).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  onClick={() => {
                    setFeedback(null);
                    runCustomStartersWithTopics();
                  }}
                >
                  Yes, add starters and topics
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setBulkPrompt(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {bulkPrompt === "custom-fill-topics" && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3"
              role="region"
              aria-label="Confirm fill topics for custom subjects"
            >
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                Add missing checklist tasks for all {customSubjectsOnly.length} Custom subjects (up
                to {customFillEstTasks} tasks if every subject had none yet). Task titles already used
                anywhere are skipped (no duplicate titles).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  onClick={() => {
                    setFeedback(null);
                    runCustomFillAllTopics();
                  }}
                >
                  Yes, fill missing topics
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setBulkPrompt(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                  onClick={() => openTopicChecklistPreview(s)}
                >
                  Topics
                </button>
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

      {topicChecklistSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => setTopicChecklistSubject(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-checklist-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2
                id="topic-checklist-heading"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Topic checklist
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {topicChecklistSubject.name}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                ✓ = already a task on this subject (not added again). The same title may still exist on
                another subject — that does not block adding it here.
              </p>
            </div>
            <ul className="max-h-[min(60vh,28rem)] overflow-y-auto px-5 py-3 text-sm">
              {getDedupedConceptTaskTitles(
                topicChecklistSubject.category,
                topicChecklistSubject.name
              ).map((title) => {
                const norm = normalizeSubjectName(title);
                const onThisSubject = tasks.some(
                  (t) =>
                    t.subjectId === topicChecklistSubject.id &&
                    normalizeSubjectName(t.title) === norm
                );
                return (
                  <li
                    key={title}
                    className={`flex gap-2 border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800/80 ${
                      onThisSubject
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    <span className="shrink-0 font-medium tabular-nums" aria-hidden="true">
                      {onThisSubject ? "✓" : "○"}
                    </span>
                    <span>{title}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                onClick={confirmAddTopicsFromPreview}
              >
                Add missing tasks
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                onClick={() => setTopicChecklistSubject(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

