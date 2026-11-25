// ─────────────────────────────────────────────────────────────────
// Taskify — Shared TypeScript Types
// Single source of truth for all data shapes.
// Always import from "@/types" — never duplicate these elsewhere.
// ─────────────────────────────────────────────────────────────────

// ── Task Archetypes / Types ──────────────────────────────────────
// Generalized into 3 practical modes:
// 1. "checklist" — sub-items checklist (default)
// 2. "counter"   — countable task with incremental [+] button (e.g. 5 glasses of water)
// 3. "timed"     — interactive duration dial / slider
export type TaskArchetype =
  | "checklist"   // Checklist with sub-items
  | "counter"     // Countable target (e.g. 5 glasses, 10 pages)
  | "timed";      // Freeform time duration via dial/slider

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

// ── Sub-item (for Checklist tasks) ───────────────────────────────
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

  // Type-specific fields:
  subItems?: SubItem[];         // for "checklist"
  targetCount?: number;         // for "counter" (e.g. 5)
  currentCount?: number;        // for "counter" (e.g. 2 / 5)
  unit?: string;                // for "counter" (e.g. "glasses", "pages", "reps")
  durationMinutes?: number;     // for "timed" target (e.g. 45 min)
  completedMinutes?: number;    // for "timed" progress completed (e.g. 15 min)

  scheduledDate?: string;       // ISO date string "YYYY-MM-DD"
  scheduledStartTime?: string;  // "HH:MM" — start time within the day (calendar view)
  slotIndex?: number;           // 0-indexed position in the day's 5 slots

  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
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

// ── Days of the Week ──────────────────────────────────────────────
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// ── User Settings ─────────────────────────────────────────────────
export interface UserSettings {
  dailyCapacity: number;       // max tasks per day (default: 5)
  pomodoroDuration: number;    // minutes per session (default: 25)
  shortBreak: number;          // minutes (default: 5)
  longBreak: number;           // minutes (default: 15)
  longBreakInterval: number;   // sessions before long break (default: 4)
  soundscape: "none" | "rain" | "forest" | "cafe" | "white-noise";
  startOfWeek: DayOfWeek;
  weekendDays?: DayOfWeek[];
  dayStartHour: number;        // 0–23, hour the weekly calendar day starts (default 6)
}
