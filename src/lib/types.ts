export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "doing" | "done";
export type SessionStatus = "planned" | "done" | "missed";
export type SubjectCategory =
  | "gcse"
  | "alevel"
  | "btec"
  | "codingTraineeship"
  | "university"
  | "custom";

export interface Subject {
  id: string;
  name: string;
  color: string;
  category: SubjectCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string | null;
  dueDate: string | null; // YYYY-MM-DD
  priority: Priority;
  estimateMinutes: number | null;
  notes: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface AvailabilityRule {
  id: string;
  weekday: number; // 0 Sun .. 6 Sat
  startMinutes: number;
  endMinutes: number;
}

export interface StudySession {
  id: string;
  taskId: string | null;
  date: string; // YYYY-MM-DD
  startMinutes: number;
  endMinutes: number;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerState {
  subjects: Subject[];
  tasks: Task[];
  availability: AvailabilityRule[];
  sessions: StudySession[];
}

export const STORAGE_KEY = "study-planner-v1";

export const DEFAULT_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ec4899",
];
