"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_COLORS,
  type AvailabilityRule,
  type PlannerState,
  type Priority,
  type SessionStatus,
  type StudySession,
  type Subject,
  type SubjectCategory,
  type Task,
  type TaskStatus,
} from "@/lib/types";
import { buildDemoPlannerState, defaultState, loadState, saveState } from "@/lib/storage";
import { normalizeSubjectName } from "@/lib/subjectTemplates";
import { mergeDuplicateTasksFields } from "@/lib/mergeDuplicateTasks";
import { findConflictingTaskTitle } from "@/lib/taskTitleDedupe";

function nowISO(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

type PlannerContextValue = {
  state: PlannerState;
  subjects: Subject[];
  tasks: Task[];
  availability: AvailabilityRule[];
  sessions: StudySession[];
  upsertSubject: (
    s: Omit<Subject, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => string | undefined;
  deleteSubject: (id: string) => void;
  mergeSubjects: (fromId: string, intoId: string) => void;
  upsertTask: (
    t: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => boolean;
  deleteTask: (id: string) => void;
  /** Merge duplicate rows into keepers, reassign sessions, remove merged-from tasks (single transaction). */
  mergeDuplicateTaskGroups: (
    plans: readonly {
      keeperId: string;
      mergeFromIds: readonly string[];
    }[]
  ) => void;
  upsertAvailability: (
    a: Omit<AvailabilityRule, "id"> & { id?: string }
  ) => void;
  deleteAvailability: (id: string) => void;
  upsertSession: (
    s: Omit<StudySession, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => void;
  deleteSession: (id: string) => void;
  importState: (json: string) => void;
  exportState: () => string;
  reset: () => void;
  loadDemo: () => void;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => loadState() ?? defaultState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const set = useCallback((updater: (p: PlannerState) => PlannerState) => {
    setState((prev) => updater(prev));
  }, []);

  const upsertSubject = useCallback(
    (
      input: Omit<Subject, "id" | "createdAt" | "updatedAt"> & { id?: string }
    ): string | undefined => {
      const t = nowISO();
      let resultId: string | undefined;
      set((p) => {
        if (input.id) {
          const desired = normalizeSubjectName(input.name);
          const conflict = p.subjects.find(
            (s) => s.id !== input.id && normalizeSubjectName(s.name) === desired
          );
          if (conflict) {
            return p;
          }
          resultId = input.id;
          return {
            ...p,
            subjects: p.subjects.map((s) =>
              s.id === input.id
                ? { ...s, ...input, id: input.id, updatedAt: t }
                : s
            ),
          };
        }
        const desired = normalizeSubjectName(input.name);
        const exists = p.subjects.some((s) => normalizeSubjectName(s.name) === desired);
        if (exists) {
          return p;
        }
        const color =
          input.color ||
          DEFAULT_COLORS[p.subjects.length % DEFAULT_COLORS.length];
        const category: SubjectCategory = input.category ?? "custom";
        const s: Subject = {
          id: newId(),
          name: input.name,
          color,
          category,
          createdAt: t,
          updatedAt: t,
        };
        resultId = s.id;
        return { ...p, subjects: [...p.subjects, s] };
      });
      return resultId;
    },
    [set]
  );

  const deleteSubject = useCallback(
    (id: string) => {
      set((p) => ({
        ...p,
        subjects: p.subjects.filter((s) => s.id !== id),
        tasks: p.tasks.map((t) =>
          t.subjectId === id ? { ...t, subjectId: null, updatedAt: nowISO() } : t
        ),
      }));
    },
    [set]
  );

  const mergeSubjects = useCallback(
    (fromId: string, intoId: string) => {
      if (fromId === intoId) return;
      set((p) => ({
        ...p,
        tasks: p.tasks.map((t) =>
          t.subjectId === fromId ? { ...t, subjectId: intoId, updatedAt: nowISO() } : t
        ),
      }));
    },
    [set]
  );

  const upsertTask = useCallback(
    (
      input: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string }
    ): boolean => {
      const ts = nowISO();
      const title = input.title.trim();
      const key = normalizeSubjectName(title);
      if (!key) return false;

      let applied = false;
      set((p) => {
        if (
          findConflictingTaskTitle(p.tasks, title, {
            excludeTaskId: input.id,
          })
        ) {
          return p;
        }

        if (input.id) {
          applied = true;
          return {
            ...p,
            tasks: p.tasks.map((x) =>
              x.id === input.id
                ? {
                    ...x,
                    ...input,
                    title,
                    id: input.id,
                    updatedAt: ts,
                    completedAt:
                      input.status === "done" ? (x.completedAt || ts) : null,
                  }
                : x
            ),
          };
        }
        const task: Task = {
          id: newId(),
          title,
          subjectId: input.subjectId,
          dueDate: input.dueDate,
          priority: input.priority,
          estimateMinutes: input.estimateMinutes,
          notes: input.notes,
          status: input.status,
          createdAt: ts,
          updatedAt: ts,
          completedAt: input.status === "done" ? ts : null,
        };
        applied = true;
        return { ...p, tasks: [...p.tasks, task] };
      });
      return applied;
    },
    [set]
  );

  const deleteTask = useCallback(
    (id: string) => {
      set((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => t.id !== id),
        sessions: p.sessions.map((s) =>
          s.taskId === id ? { ...s, taskId: null, updatedAt: nowISO() } : s
        ),
      }));
    },
    [set]
  );

  const mergeDuplicateTaskGroups = useCallback(
    (
      plans: readonly {
        keeperId: string;
        mergeFromIds: readonly string[];
      }[]
    ) => {
      const ts = nowISO();
      set((p) => {
        const duplicateToKeeper = new Map<string, string>();
        const removeIds = new Set<string>();
        const keeperRows = new Map<string, Task>();

        for (const plan of plans) {
          const keeper = p.tasks.find((t) => t.id === plan.keeperId);
          if (!keeper) continue;
          const others = plan.mergeFromIds
            .filter((id) => id !== plan.keeperId)
            .map((id) => p.tasks.find((t) => t.id === id))
            .filter((t): t is Task => Boolean(t));
          if (others.length === 0) continue;

          const mergedFields = mergeDuplicateTasksFields(keeper, others);
          keeperRows.set(plan.keeperId, {
            ...keeper,
            ...mergedFields,
            id: plan.keeperId,
            createdAt: keeper.createdAt,
            updatedAt: ts,
            completedAt:
              mergedFields.status === "done"
                ? mergedFields.completedAt ?? keeper.completedAt ?? ts
                : null,
          });

          for (const id of plan.mergeFromIds) {
            if (id !== plan.keeperId) {
              removeIds.add(id);
              duplicateToKeeper.set(id, plan.keeperId);
            }
          }
        }

        if (removeIds.size === 0 && keeperRows.size === 0) return p;

        const tasks = p.tasks
          .filter((t) => !removeIds.has(t.id))
          .map((t) => keeperRows.get(t.id) ?? t);

        const sessions = p.sessions.map((s) => {
          if (!s.taskId) return s;
          const onto = duplicateToKeeper.get(s.taskId);
          return onto
            ? { ...s, taskId: onto, updatedAt: ts }
            : s;
        });

        return { ...p, tasks, sessions };
      });
    },
    [set]
  );

  const upsertAvailability = useCallback(
    (input: Omit<AvailabilityRule, "id"> & { id?: string }) => {
      set((p) => {
        if (input.id) {
          return {
            ...p,
            availability: p.availability.map((a) =>
              a.id === input.id ? { ...a, ...input, id: input.id } : a
            ),
          };
        }
        const row: AvailabilityRule = {
          id: newId(),
          weekday: input.weekday,
          startMinutes: input.startMinutes,
          endMinutes: input.endMinutes,
        };
        return { ...p, availability: [...p.availability, row] };
      });
    },
    [set]
  );

  const deleteAvailability = useCallback(
    (id: string) => {
      set((p) => ({
        ...p,
        availability: p.availability.filter((a) => a.id !== id),
      }));
    },
    [set]
  );

  const upsertSession = useCallback(
    (
      input: Omit<StudySession, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
      }
    ) => {
      const t = nowISO();
      set((p) => {
        if (input.id) {
          return {
            ...p,
            sessions: p.sessions.map((s) =>
              s.id === input.id
                ? { ...s, ...input, id: input.id, updatedAt: t }
                : s
            ),
          };
        }
        const session: StudySession = {
          id: newId(),
          taskId: input.taskId,
          date: input.date,
          startMinutes: input.startMinutes,
          endMinutes: input.endMinutes,
          status: input.status,
          createdAt: t,
          updatedAt: t,
        };
        return { ...p, sessions: [...p.sessions, session] };
      });
    },
    [set]
  );

  const deleteSession = useCallback(
    (id: string) => {
      set((p) => ({
        ...p,
        sessions: p.sessions.filter((s) => s.id !== id),
      }));
    },
    [set]
  );

  const importState = useCallback((json: string) => {
    const parsed = JSON.parse(json) as PlannerState;
    if (
      !parsed ||
      !Array.isArray(parsed.subjects) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.availability) ||
      !Array.isArray(parsed.sessions)
    ) {
      throw new Error("Invalid backup file");
    }
    const seenTitles = new Set<string>();
    for (const task of parsed.tasks) {
      const k = normalizeSubjectName(String(task.title ?? "").trim());
      if (!k) continue;
      if (seenTitles.has(k)) {
        throw new Error(
          "Backup contains duplicate task titles (spacing and letter case are ignored when comparing)."
        );
      }
      seenTitles.add(k);
    }
    setState(parsed);
  }, []);

  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const reset = useCallback(() => {
    const next = defaultState();
    setState(next);
    saveState(next);
  }, []);

  const loadDemo = useCallback(() => {
    const next = buildDemoPlannerState();
    setState(next);
    saveState(next);
  }, []);

  const value = useMemo<PlannerContextValue>(
    () => ({
      state,
      subjects: state.subjects,
      tasks: state.tasks,
      availability: state.availability,
      sessions: state.sessions,
      upsertSubject,
      deleteSubject,
      mergeSubjects,
      upsertTask,
      deleteTask,
      mergeDuplicateTaskGroups,
      upsertAvailability,
      deleteAvailability,
      upsertSession,
      deleteSession,
      importState,
      exportState,
      reset,
      loadDemo,
    }),
    [
      state,
      upsertSubject,
      deleteSubject,
      mergeSubjects,
      upsertTask,
      deleteTask,
      mergeDuplicateTaskGroups,
      upsertAvailability,
      deleteAvailability,
      upsertSession,
      deleteSession,
      importState,
      exportState,
      reset,
      loadDemo,
    ]
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}

export type { Priority, TaskStatus, SessionStatus };
