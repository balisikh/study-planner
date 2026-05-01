"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";
import { formatDisplayDate } from "@/lib/dates";
import { findDuplicateTitleGroups } from "@/lib/taskTitleDedupe";
import type { Task } from "@/lib/types";

function backupFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
  return `study-planner-backup-${stamp}.json`;
}

export default function SettingsPage() {
  const {
    exportState,
    importState,
    reset,
    loadDemo,
    tasks,
    subjects,
    sessions,
    mergeDuplicateTaskGroups,
  } = usePlanner();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [demoConfirm, setDemoConfirm] = useState(false);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [dedupeFeedback, setDedupeFeedback] = useState<string | null>(null);

  const duplicateGroups = useMemo(() => findDuplicateTitleGroups(tasks), [tasks]);

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const sessionsLinkedToTask = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions) {
      if (!s.taskId) continue;
      m.set(s.taskId, (m.get(s.taskId) ?? 0) + 1);
    }
    return m;
  }, [sessions]);

  /** User override per normalized key; falls back to oldest task in each group. */
  const [keeperByNormKey, setKeeperByNormKey] = useState<Record<string, string>>(
    {}
  );

  function keeperIdForGroup(g: (typeof duplicateGroups)[0]): string {
    const chosen = keeperByNormKey[g.normalizedKey];
    if (chosen && g.tasks.some((t) => t.id === chosen)) return chosen;
    return g.tasks[0]?.id ?? "";
  }

  useEffect(() => {
    if (!dedupeFeedback) return;
    const id = window.setTimeout(() => setDedupeFeedback(null), 6500);
    return () => window.clearTimeout(id);
  }, [dedupeFeedback]);

  function taskSummaryLine(t: Task): string {
    const sub = t.subjectId ? subjectById[t.subjectId] : null;
    const subPart = sub ? sub.name : "No subject";
    const due = t.dueDate ? ` · due ${formatDisplayDate(t.dueDate)}` : "";
    const links = sessionsLinkedToTask.get(t.id) ?? 0;
    const linkPart =
      links === 0 ? "" : ` · ${links} scheduled session${links === 1 ? "" : "s"}`;
    return `${subPart} · ${t.status}${due}${linkPart}`;
  }

  function applyTaskDedupe() {
    const plans = duplicateGroups
      .map((g) => {
        const keeperId = keeperIdForGroup(g);
        const mergeFromIds = g.tasks
          .map((t) => t.id)
          .filter((id) => id !== keeperId);
        return { keeperId, mergeFromIds };
      })
      .filter((p) => p.mergeFromIds.length > 0);

    const removedCount = plans.reduce((n, p) => n + p.mergeFromIds.length, 0);
    if (removedCount === 0) return;

    const msg = [
      `Merge and remove ${removedCount} duplicate task(s)?`,
      "For each clash, the row you selected keeps its title and creation date.",
      "Notes from every copy are merged (unique blocks, oldest-first).",
      "Due date becomes the earliest; priority the strongest; estimate the largest value among copies;",
      "status becomes the most progressed (done beats doing beats todo).",
      "Sessions linked to a removed copy will point at the kept task instead.",
      "Download a backup first if you are unsure.",
    ].join(" ");
    if (!window.confirm(msg)) return;

    mergeDuplicateTaskGroups(plans);
    setDedupeFeedback(
      `Merged into ${plans.length} keeper task(s) and removed ${removedCount} duplicate(s).`
    );
  }

  function download(filename: string, text: string) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImportFile(f: File) {
    setImportError(null);
    try {
      const text = await f.text();
      importState(text);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed");
    }
  }

  useEffect(() => {
    if (!backupNotice) return;
    const id = window.setTimeout(() => setBackupNotice(null), 4500);
    return () => window.clearTimeout(id);
  }, [backupNotice]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Data stays in this browser — download a backup regularly under Backup & restore.
        </p>
      </div>

      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3"
        aria-labelledby="settings-backup-heading"
      >
        <h2 id="settings-backup-heading" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Backup & restore
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Download a backup file with everything in your planner (subjects, tasks, availability rules,
          and scheduled sessions). Store it somewhere safe — USB drive, cloud folder, or email to yourself.
          Restore anytime with Restore backup.
        </p>
        {backupNotice && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status" aria-live="polite">
            {backupNotice}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            aria-label="Download planner backup as a JSON file"
            onClick={() => {
              download(backupFilename(), exportState());
              setBackupNotice("Backup downloaded — check your Downloads folder.");
            }}
          >
            Download backup
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportFile(f);
              e.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            aria-label="Restore planner from a JSON backup file"
            onClick={() => fileRef.current?.click()}
          >
            Restore backup
          </button>
        </div>
        {importError && (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {importError}
          </p>
        )}
      </section>

      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
        aria-labelledby="settings-dedupe-heading"
      >
        <h2
          id="settings-dedupe-heading"
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
        >
          Duplicate task titles
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Older data might contain tasks that share the same title when spacing or letter case are
          ignored. New saves block duplicates; use this tool to clean up what is already stored.
          For each clash, choose the task row to <span className="font-medium">keep</span>. On
          confirm, fields from the other copies are <span className="font-medium">merged</span> into
          that row (notes, due date, priority, estimate, status, subject if missing), scheduled
          sessions are reassigned to the keeper, then duplicates are removed.
        </p>
        {dedupeFeedback && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status" aria-live="polite">
            {dedupeFeedback}
          </p>
        )}
        {duplicateGroups.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No duplicate titles found — nothing to fix here.
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {duplicateGroups.length} clash
              {duplicateGroups.length === 1 ? "" : "es"} (
              {duplicateGroups.reduce((n, g) => n + g.tasks.length, 0)} tasks involved)
            </p>
            <div className="space-y-6">
              {duplicateGroups.map((g, gi) => (
                <fieldset
                  key={g.normalizedKey}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                >
                  <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    Same title as &ldquo;{g.tasks[0]?.title ?? g.normalizedKey}&rdquo; (
                    {g.tasks.length} copies)
                  </legend>
                  <ul className="space-y-2">
                    {g.tasks.map((t) => {
                      const keeperId = keeperIdForGroup(g);
                      return (
                        <li key={t.id}>
                          <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50/60 dark:has-[:checked]:border-indigo-800 dark:has-[:checked]:bg-indigo-950/30">
                            <input
                              type="radio"
                              className="mt-1"
                              name={`dedupe-grp-${gi}`}
                              checked={keeperId === t.id}
                              onChange={() =>
                                setKeeperByNormKey((prev) => ({
                                  ...prev,
                                  [g.normalizedKey]: t.id,
                                }))
                              }
                            />
                            <span className="min-w-0 flex-1 text-sm">
                              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                {t.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                                {taskSummaryLine(t)}
                              </span>
                              <span className="mt-0.5 block font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                                id {t.id}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                onClick={applyTaskDedupe}
              >
                Merge & remove duplicates
              </button>
            </div>
          </>
        )}
      </section>

      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3"
        aria-labelledby="settings-demo-heading"
      >
        <h2
          id="settings-demo-heading"
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
        >
          Demo data
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Loads GCSE Maths topic tasks (spread across the next two weeks), sample Custom subjects,
          and two Schedule sessions. This replaces everything currently stored in this browser.
        </p>
        {demoFeedback && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status" aria-live="polite">
            {demoFeedback}
          </p>
        )}
        {demoError && (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {demoError}
          </p>
        )}
        {!demoConfirm ? (
          <button
            type="button"
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950"
            onClick={() => {
              setDemoFeedback(null);
              setDemoError(null);
              setDemoConfirm(true);
            }}
          >
            Load demo data
          </button>
        ) : (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3"
            role="region"
            aria-label="Confirm replace with demo"
          >
            <p className="text-sm text-zinc-800 dark:text-zinc-200">
              Your current planner will be overwritten by the demo. Use Download backup (above)
              first if you want to keep what you have.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                onClick={() => {
                  try {
                    setDemoError(null);
                    loadDemo();
                    setDemoConfirm(false);
                    setDemoFeedback("Demo loaded. Check Tasks, Subjects, and Schedule.");
                  } catch (e) {
                    setDemoFeedback(null);
                    setDemoError(
                      e instanceof Error ? e.message : "Could not load demo data."
                    );
                  }
                }}
              >
                Yes, replace with demo
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                onClick={() => {
                  setDemoConfirm(false);
                  setDemoError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3"
        aria-labelledby="settings-danger-heading"
      >
        <h2 id="settings-danger-heading" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Danger zone
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Reset clears all local data in this browser.
        </p>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          onClick={() => {
            if (confirm("Reset all data? This cannot be undone.")) reset();
          }}
        >
          Reset all data
        </button>
      </section>
    </div>
  );
}

