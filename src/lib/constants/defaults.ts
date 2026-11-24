import { UserSettings, Priority, TaskArchetype } from "@/types";

/**
 * ─────────────────────────────────────────────────────────────────
 * App-wide Default Configurations & Settings
 * Used as fallback values and initial state for UserSettings.
 * Can be overridden by user preferences in /settings later.
 * ─────────────────────────────────────────────────────────────────
 */

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyCapacity: 5,            // Max slots per day (Rule of 5)
  pomodoroDuration: 25,        // Minutes per work session
  shortBreak: 5,               // Minutes per short break
  longBreak: 15,               // Minutes per long break
  longBreakInterval: 4,        // Cycles before long break
  soundscape: "none",
  startOfWeek: "monday",
  weekendDays: ["saturday", "sunday"],
};

export const DEFAULT_TASK_CONFIG = {
  defaultArchetype: "checklist" as TaskArchetype,
  defaultPriority: "P1" as Priority,
  defaultDurationMinutes: 30, // For "timed" task dial
  defaultTargetCount: 5,      // For "counter" task
  defaultUnit: "reps",        // For "counter" task
  slotCapacity: DEFAULT_USER_SETTINGS.dailyCapacity,
};
