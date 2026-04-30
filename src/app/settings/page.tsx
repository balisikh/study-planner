"use client";

import { useRef, useState } from "react";
import { usePlanner } from "@/context/PlannerProvider";

export default function SettingsPage() {
  const { exportState, importState, reset } = usePlanner();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This MVP stores data locally in your browser. Export backups regularly.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Backup
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            onClick={() =>
              download(`study-planner-backup-${new Date().toISOString().slice(0, 10)}.json`, exportState())
            }
          >
            Export JSON
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
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
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
        </div>
        {importError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {importError}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
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

