"use client";

import { useEffect, useRef, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";

function backupFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
  return `study-planner-backup-${stamp}.json`;
}

export default function SettingsPage() {
  const { exportState, importState, reset, loadDemo } = usePlanner();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [demoConfirm, setDemoConfirm] = useState(false);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

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

