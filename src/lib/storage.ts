import { addDaysISO, todayISO } from "@/lib/dates";
import type { PlannerState, StudySession, Subject, Task } from "./types";
import { DEFAULT_COLORS, STORAGE_KEY } from "./types";
import {
  CUSTOM_ESSENTIAL_SUBJECTS,
  getSuggestedSubjectColor,
  normalizeSubjectName,
} from "./subjectTemplates";

const PRESET_CUSTOM_CREATED_AT = "2026-01-01T00:00:00.000Z";

/** Shown on brand-new installs: one GCSE subject + topic-style tasks. */
const DEMO_GCSE_MATHS_SUBJECT_ID = "preset-demo-gcse-mathematics";

function presetCustomSubjectId(name: string): string {
  return `preset-custom-${normalizeSubjectName(name).replace(/\s+/g, "-")}`;
}

function defaultCustomSubjects(): Subject[] {
  return CUSTOM_ESSENTIAL_SUBJECTS.map((name, i) => ({
    id: presetCustomSubjectId(name),
    name,
    color:
      getSuggestedSubjectColor(name) ??
      DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    category: "custom",
    createdAt: PRESET_CUSTOM_CREATED_AT,
    updatedAt: PRESET_CUSTOM_CREATED_AT,
  }));
}

function demoGcseMathsSubject(): Subject {
  return {
    id: DEMO_GCSE_MATHS_SUBJECT_ID,
    name: "Mathematics",
    color:
      getSuggestedSubjectColor("Mathematics") ?? DEFAULT_COLORS[0],
    category: "gcse",
    createdAt: PRESET_CUSTOM_CREATED_AT,
    updatedAt: PRESET_CUSTOM_CREATED_AT,
  };
}

/** Demo tasks: due dates are spread from `anchorDate` (usually today). */
function demoTasksForMaths(mathsSubjectId: string, anchorDate: string): Task[] {
  const t = PRESET_CUSTOM_CREATED_AT;
  const mk = (
    id: string,
    partial: Pick<Task, "title" | "dueDate" | "priority" | "status" | "estimateMinutes" | "notes">
  ): Task => ({
    id,
    subjectId: mathsSubjectId,
    createdAt: t,
    updatedAt: t,
    completedAt: partial.status === "done" ? t : null,
    ...partial,
  });
  const d = (offset: number) => addDaysISO(anchorDate, offset);
  return [
    mk("preset-demo-task-1", {
      title: "Linear equations — rearranging & solving",
      dueDate: d(3),
      priority: "medium",
      status: "todo",
      estimateMinutes: 45,
      notes: "Demo: one task per topic in Title; Notes for pages or links.",
    }),
    mk("preset-demo-task-2", {
      title: "Quadratic sequences — finding the nth term",
      dueDate: d(5),
      priority: "medium",
      status: "todo",
      estimateMinutes: 40,
      notes: "",
    }),
    mk("preset-demo-task-3", {
      title: "Percentages — compound change & multipliers",
      dueDate: d(7),
      priority: "high",
      status: "doing",
      estimateMinutes: 50,
      notes: "Split large units into several tasks like this.",
    }),
    mk("preset-demo-task-4", {
      title: "Pythagoras — 2D & 3D mixed problems",
      dueDate: d(9),
      priority: "medium",
      status: "todo",
      estimateMinutes: 35,
      notes: "",
    }),
    mk("preset-demo-task-5", {
      title: "Probability — tree diagrams & AND/OR rules",
      dueDate: d(11),
      priority: "low",
      status: "todo",
      estimateMinutes: 55,
      notes: "",
    }),
    mk("preset-demo-task-6", {
      title: "Trigonometry — SOHCAHTOA & bearings",
      dueDate: d(13),
      priority: "medium",
      status: "todo",
      estimateMinutes: 45,
      notes: "",
    }),
    mk("preset-demo-task-7", {
      title: "Histograms — frequency density",
      dueDate: d(-4),
      priority: "medium",
      status: "done",
      estimateMinutes: 30,
      notes: "Example completed task.",
    }),
  ];
}

function demoSessions(taskLinearId: string, anchorDate: string): StudySession[] {
  const t = PRESET_CUSTOM_CREATED_AT;
  const day1 = addDaysISO(anchorDate, 1);
  const day2 = addDaysISO(anchorDate, 3);
  return [
    {
      id: "preset-demo-session-1",
      taskId: taskLinearId,
      date: day1,
      startMinutes: 9 * 60,
      endMinutes: 10 * 60,
      status: "planned",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "preset-demo-session-2",
      taskId: null,
      date: day2,
      startMinutes: 14 * 60,
      endMinutes: 15 * 60 + 30,
      status: "planned",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

/** Full demo snapshot (relative dates). Use for first load or Settings → Load demo. */
export function buildDemoPlannerState(): PlannerState {
  const anchor = todayISO();
  const maths = demoGcseMathsSubject();
  return {
    subjects: [maths, ...defaultCustomSubjects()],
    tasks: demoTasksForMaths(maths.id, anchor),
    availability: [],
    sessions: demoSessions("preset-demo-task-1", anchor),
  };
}

export function loadState(): PlannerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlannerState;
    // Lightweight migration: older subjects may not have `category`.
    if (Array.isArray(parsed.subjects)) {
      parsed.subjects = parsed.subjects.map((s) => ({
        ...s,
        category: s.category ?? "custom",
      }));
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PlannerState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function defaultState(): PlannerState {
  return buildDemoPlannerState();
}
