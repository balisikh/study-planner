"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/schedule", label: "Schedule" },
  { href: "/timetable", label: "Timetable" },
  { href: "/subjects", label: "Subjects" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-full flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
      >
        Skip to main content
      </a>
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Study Planner
            </Link>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Primary">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 rounded-sm"
      >
        {children}
      </main>
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        Data stays in this browser — use Settings → Download backup for a copy of your planner.
      </footer>
    </div>
  );
}
