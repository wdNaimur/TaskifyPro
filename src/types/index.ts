// ─────────────────────────────────────────────────────────────────
// Taskify — Shared TypeScript Types
// Single source of truth for all data shapes.
// Always import from "@/types" — never duplicate these elsewhere.
// ─────────────────────────────────────────────────────────────────

// ── Task Archetypes ──────────────────────────────────────────────
// Each task in Taskify has one of four archetypes.
// The archetype controls how the task looks and behaves.
export type TaskArchetype =
  | "quick-check"    // ≤15 min checklist-style task
  | "short"          // 15–45 min focused task
  | "pomodoro"       // 1+ Pomodoro sessions (25 min blocks)
  | "epic";          // Multi-day milestone with sub-tasks

// ── Priority Levels ──────────────────────────────────────────────
export type Priority = "P0" | "P1" | "P2";

// ── Task Status ──────────────────────────────────────────────────
export type TaskStatus =
  | "staged"      // In backlog, not yet scheduled
  | "scheduled"   // Assigned to a day slot
  | "in-progress" // Currently being worked on
  | "done"        // Completed
  | "missed"      // Scheduled but not completed — carryover candidate
  | "cancelled";

// ── Sub-item (for Quick Check tasks) ─────────────────────────────
export interface SubItem {
  id: string;
  label: string;
  done: boolean;
}

// ── Main Task Interface ───────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  archetype: TaskArchetype;
  priority: Priority;
  status: TaskStatus;

  // Optional fields — only relevant for certain archetypes
  durationMinutes?: number;    // short / pomodoro tasks
  pomodoroCount?: number;      // how many 25-min sessions
  subItems?: SubItem[];        // quick-check checklist items
  milestones?: string[];       // epic breakdown steps

  scheduledDate?: string;      // ISO date string "YYYY-MM-DD"
  slotIndex?: number;          // 0-indexed position in the day's 5 slots

  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}

// ── Habit Types ──────────────────────────────────────────────────
export type HabitType =
  | "binary"      // Simple yes/no daily check-off
  | "quantitative"// Numeric counter (e.g. "8 glasses of water")
  | "timed"       // Duration-based (e.g. "30 min of reading")
  | "reflection"; // Weekly reflection routine

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  targetValue?: number;   // quantitative: target count / timed: target minutes
  unit?: string;          // quantitative: "glasses" / timed: "min"
  streak: number;         // current consecutive-day streak
  createdAt: string;
}

// ── Habit Log Entry ───────────────────────────────────────────────
// One record per day per habit — stored in IndexedDB via Dexie.js (Sprint 7+)
export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: string;         // "YYYY-MM-DD"
  done: boolean;
  value?: number;       // for quantitative/timed habits
  note?: string;        // optional reflection note
}

// ── User Settings ─────────────────────────────────────────────────
export interface UserSettings {
  dailyCapacity: number;       // max tasks per day (default: 5)
  pomodoroDuration: number;    // minutes per session (default: 25)
  shortBreak: number;          // minutes (default: 5)
  longBreak: number;           // minutes (default: 15)
  longBreakInterval: number;   // sessions before long break (default: 4)
  soundscape: "none" | "rain" | "forest" | "cafe" | "white-noise";
  startOfWeek: "monday" | "sunday";
}
