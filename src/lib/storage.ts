import type { PlannerState, Subject } from "./types";
import { DEFAULT_COLORS, STORAGE_KEY } from "./types";
import {
  CUSTOM_ESSENTIAL_SUBJECTS,
  getSuggestedSubjectColor,
  normalizeSubjectName,
} from "./subjectTemplates";

const PRESET_CUSTOM_CREATED_AT = "2026-01-01T00:00:00.000Z";

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
  return {
    subjects: defaultCustomSubjects(),
    tasks: [],
    availability: [],
    sessions: [],
  };
}
