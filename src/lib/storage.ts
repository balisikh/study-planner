import type { PlannerState } from "./types";
import { STORAGE_KEY } from "./types";

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
    subjects: [],
    tasks: [],
    availability: [],
    sessions: [],
  };
}
